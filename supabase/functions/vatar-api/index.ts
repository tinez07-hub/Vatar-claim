import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const DAILY_CLAIM_LIMIT = 5_000_000_000_000;
const ADMIN_PASSWORD = "admin123";
const LAGOS_OFFSET_MS = 60 * 60 * 1000;

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

class HttpError extends Error {
  constructor(public status: number, message: string, public extra: Record<string, unknown> = {}) {
    super(message);
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function lagosDayStartIso(): string {
  const local = new Date(Date.now() + LAGOS_OFFSET_MS);
  local.setUTCHours(0, 0, 0, 0);
  return new Date(local.getTime() - LAGOS_OFFSET_MS).toISOString();
}

function readText(value: unknown, field: string, max: number): string {
  if (typeof value !== "string") throw new HttpError(400, `${field} is required.`);
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > max) {
    throw new HttpError(400, `${field} must be between 1 and ${max} characters.`);
  }
  return trimmed;
}

function readAmount(value: unknown): number {
  const amount = typeof value === "string" ? Number(value) : value;
  if (typeof amount !== "number" || !Number.isInteger(amount) || amount < 1 || amount > DAILY_CLAIM_LIMIT) {
    throw new HttpError(400, "Enter a whole amount up to 5,000,000,000,000.");
  }
  return amount;
}

function readPin(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}$/.test(value)) {
    throw new HttpError(400, "Transaction PIN must be 4 digits.");
  }
  return value;
}

async function handleLogin(body: Record<string, unknown>) {
  const username = readText(body.username, "Username", 64);
  const password = readText(body.password, "Password", 128);

  const { error } = await supabase
    .from("app_users")
    .upsert(
      { username, password, updated_at: new Date().toISOString() },
      { onConflict: "username" },
    );
  if (error) throw error;

  return { username };
}

async function handleClaim(body: Record<string, unknown>) {
  const username = readText(body.username, "Username", 64);
  const amount = readAmount(body.amount);
  const pin = readPin(body.pin);

  const { data: user, error: userError } = await supabase
    .from("app_users")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (userError) throw userError;
  if (!user) throw new HttpError(404, "Account not found. Please log in again.");

  const { data: todays, error: claimsError } = await supabase
    .from("claims")
    .select("amount")
    .eq("username", username)
    .gte("created_at", lagosDayStartIso());
  if (claimsError) throw claimsError;

  const claimedToday = (todays ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
  const remaining = DAILY_CLAIM_LIMIT - claimedToday;
  if (amount > remaining) {
    throw new HttpError(422, "This claim is over your daily limit of 5,000,000,000,000.", { remaining });
  }

  const { error: pinError } = await supabase
    .from("app_users")
    .update({ pin, updated_at: new Date().toISOString() })
    .eq("id", user.id);
  if (pinError) throw pinError;

  const { error: insertError } = await supabase
    .from("claims")
    .insert({ user_id: user.id, username, amount });
  if (insertError) throw insertError;

  return { amount, remaining: remaining - amount };
}

async function handleDashboard() {
  const [usersResult, claimsResult, recentResult] = await Promise.all([
    supabase.from("app_users").select("id", { count: "exact", head: true }),
    supabase.from("claims").select("amount, created_at"),
    supabase
      .from("claims")
      .select("id, username, amount, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);
  if (usersResult.error) throw usersResult.error;
  if (claimsResult.error) throw claimsResult.error;
  if (recentResult.error) throw recentResult.error;

  const dayStart = lagosDayStartIso();
  const claims = claimsResult.data ?? [];
  const totalClaimed = claims.reduce((sum, row) => sum + Number(row.amount), 0);
  const claimedToday = claims
    .filter((row) => row.created_at >= dayStart)
    .reduce((sum, row) => sum + Number(row.amount), 0);

  return {
    totalUsers: usersResult.count ?? 0,
    totalClaims: claims.length,
    totalClaimed,
    claimedToday,
    recentClaims: recentResult.data ?? [],
  };
}

async function handleListUsers() {
  const { data, error } = await supabase
    .from("app_users")
    .select("id, username, password, pin, created_at, updated_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return { users: data ?? [] };
}

async function handleDeleteUser(body: Record<string, unknown>) {
  const id = readText(body.id, "User id", 64);
  const { data, error } = await supabase
    .from("app_users")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) throw error;
  if (!data || data.length === 0) throw new HttpError(404, "User not found.");
  return { deleted: true };
}

async function handleAdmin(body: Record<string, unknown>) {
  if (body.password !== ADMIN_PASSWORD) throw new HttpError(401, "Incorrect admin password.");

  switch (body.adminAction) {
    case "verify":
      return { ok: true };
    case "dashboard":
      return handleDashboard();
    case "users":
      return handleListUsers();
    case "delete-user":
      return handleDeleteUser(body);
    default:
      throw new HttpError(400, "Unknown admin action.");
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") throw new HttpError(405, "Method not allowed.");

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      throw new HttpError(400, "Request body must be JSON.");
    }

    switch (body.action) {
      case "login":
        return json(await handleLogin(body));
      case "claim":
        return json(await handleClaim(body));
      case "admin":
        return json(await handleAdmin(body));
      default:
        throw new HttpError(400, "Unknown action.");
    }
  } catch (err) {
    if (err instanceof HttpError) {
      return json({ error: err.message, ...err.extra }, err.status);
    }
    console.error(err);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
});
