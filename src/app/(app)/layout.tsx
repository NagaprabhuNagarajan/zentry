import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layouts/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Proxy already guards these routes; this is defense-in-depth and gives us
  // the user for the shell.
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, email, avatar_url")
    .eq("id", user.id)
    .single();

  const name = profile?.name ?? "";
  const email = profile?.email ?? user.email ?? "";

  return (
    <AppShell name={name} email={email} avatarUrl={profile?.avatar_url ?? null}>
      {children}
    </AppShell>
  );
}
