"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth.store";

/**
 * Subscribes the client-side auth store to Supabase auth changes. Mount once,
 * high in the authenticated tree (the app shell). Refreshes server components
 * on sign-in/out so server-rendered data stays in sync.
 */
export function useAuthSync() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "SIGNED_OUT" || event === "SIGNED_IN") {
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router, setUser]);
}

/** Convenience selector for the current user. */
export function useUser() {
  return useAuthStore((s) => s.user);
}
