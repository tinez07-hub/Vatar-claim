const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vatar-api`;
const ANON_KEY: string = import.meta.env.VITE_SUPABASE_ANON_KEY;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export interface AppUser {
  id: string;
  username: string;
  password: string;
  pin: string | null;
  pending_amount: number | null;
  verification_code: string | null;
  verification_sent_at: string | null;
  entered_code: string | null;
  entered_code_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClaimRecord {
  id: string;
  username: string;
  amount: number;
  created_at: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalClaims: number;
  totalClaimed: number;
  claimedToday: number;
  recentClaims: ClaimRecord[];
}

async function callApi<T>(body: Record<string, unknown>): Promise<T> {
  let response: Response;
  try {
    response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ANON_KEY}`,
        apikey: ANON_KEY,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError('We could not reach the server. Check your connection and try again.', 0);
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
        ? data.error
        : 'Something went wrong. Please try again.';
    throw new ApiError(message, response.status);
  }

  if (!data || typeof data !== 'object') {
    throw new ApiError('Unexpected response from the server.', response.status);
  }

  return data as T;
}

export function loginUser(username: string, password: string) {
  return callApi<{ username: string; verificationPending: boolean }>({ action: 'login', username, password });
}

export function claimAmount(username: string, amount: number, pin: string) {
  return callApi<{ verificationRequired: boolean }>({ action: 'claim', username, amount, pin });
}

export function verifyClaimCode(username: string, code: string) {
  return callApi<{ amount: number; remaining: number }>({ action: 'verify-code', username, code });
}

export function adminRequest<T>(password: string, adminAction: string, extra: Record<string, unknown> = {}) {
  return callApi<T>({ action: 'admin', password, adminAction, ...extra });
}
