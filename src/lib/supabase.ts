import "server-only";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** Read-only client: sees only what row-level security lets visitors see (published rows). */
export function publicClient() {
  if (!url || !publishable) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  return createClient(url, publishable, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Server-only client with full access. Used for the private section. Never import into client code. */
export function adminClient() {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secret) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
}
