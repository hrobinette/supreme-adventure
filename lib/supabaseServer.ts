import { createClient, SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null | undefined;

/**
 * Server-only Supabase client using the service-role key. Returns null when
 * the env vars aren't set, which lets the app fall back to local storage.
 * Never import this from a client component — the service-role key must stay
 * on the server.
 */
export function getSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    cached = null;
    return cached;
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export const SNAPSHOTS_TABLE = "snapshots";
