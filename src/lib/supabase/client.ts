"use client";

import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/lib/env";
import type { Database } from "@/types/database.types";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

/**
 * Supabase client for use in Client Components. Uses the public anon key and is
 * subject to Row Level Security. Memoized so the whole app shares one instance.
 */
export function createClient() {
  browserClient ??= createBrowserClient<Database>(
    env.supabaseUrl(),
    env.supabaseAnonKey(),
  );
  return browserClient;
}
