import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";
import type { Database } from "@/types/database.types";

/**
 * Service-role Supabase client. Bypasses RLS — use ONLY in trusted server code
 * (route handlers, server actions) after you've authenticated the caller. The
 * `server-only` import makes bundling this into client code a build error.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    env.supabaseUrl(),
    env.supabaseServiceRoleKey(),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
