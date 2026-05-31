/**
 * Validated environment access. Import the named getters rather than reading
 * `process.env` directly so a missing var fails fast with a clear message.
 *
 * NEXT_PUBLIC_* values are inlined into the client bundle (safe — protected by
 * RLS). Server-only secrets must never be read from client components.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. See .env.example.`,
    );
  }
  return value;
}

export const env = {
  supabaseUrl: () =>
    required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: () =>
    required(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
  /** Server-only. Throws if accidentally evaluated in the browser. */
  supabaseServiceRoleKey: () => {
    if (typeof window !== "undefined") {
      throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY must not be used client-side.",
      );
    }
    return required(
      "SUPABASE_SERVICE_ROLE_KEY",
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  },
};
