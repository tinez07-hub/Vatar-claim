/*
# Create VATAR users and claims tables

Plain-English summary: stores the accounts created from the login page (username, password, transaction PIN) and a history of every claim made. Both tables are only reachable through the server-side API, never directly from the browser.

1. New Tables
- `app_users`: one row per username. Holds the username, the password entered at login, the latest transaction PIN, and timestamps.
- `claims`: one row per successful claim. Holds the username, the amount claimed, and when it happened. Linked to the user with a soft link so claim history survives if a user is deleted.

2. Security
- Row level security is enabled on both tables with no browser-facing policies, so the anon and authenticated roles cannot read or write them.
- Only the `service_role` (used by the server-side API function) is granted access.

3. Important notes
- 3.1 Amounts are stored as whole numbers and limited to between 1 and 5,000,000,000,000 at the database level.
- 3.2 Deleting a user removes their row in `app_users` but keeps their claims, with the user link cleared.
*/

CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  pin text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
  username text NOT NULL,
  amount bigint NOT NULL CHECK (amount > 0 AND amount <= 5000000000000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS claims_created_at_idx ON claims (created_at);
CREATE INDEX IF NOT EXISTS claims_username_created_idx ON claims (username, created_at);

ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON app_users TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON claims TO service_role;
