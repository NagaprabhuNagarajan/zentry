"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { useAuthSync } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarNav } from "@/components/layouts/sidebar-nav";
import { UserMenu } from "@/components/layouts/user-menu";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Logo } from "@/components/common/logo";

interface AppShellProps {
  name: string;
  email: string;
  avatarUrl?: string | null;
  children: React.ReactNode;
}

function Brand() {
  return (
    <Link href="/dashboard" aria-label="Zentry">
      <Logo />
    </Link>
  );
}

export function AppShell({ name, email, avatarUrl, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  useAuthSync();

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop sidebar — pinned full-height, non-scrolling */}
      <aside className="border-border bg-sidebar sticky top-0 hidden h-screen w-60 shrink-0 flex-col overflow-hidden border-r lg:flex print:!hidden">
        <div className="flex h-16 items-center px-6">
          <Brand />
        </div>
        <div className="flex-1 px-3 py-2">
          <SidebarNav />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="border-border bg-background/80 sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 backdrop-blur-md lg:px-6 print:hidden">
          {/* Mobile nav trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Open navigation"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="px-6 py-4">
                <Brand />
              </SheetTitle>
              <div className="px-3">
                <SidebarNav onNavigate={() => setMobileOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>

          <div className="lg:hidden">
            <Brand />
          </div>

          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <UserMenu name={name} email={email} avatarUrl={avatarUrl} />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
