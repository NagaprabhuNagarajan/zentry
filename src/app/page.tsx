import Link from "next/link";
import { ArrowRight, LineChart, PiggyBank, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

const HIGHLIGHTS = [
  {
    icon: Wallet,
    title: "Expense tracking",
    body: "Log spending by category and see where your money goes each month.",
  },
  {
    icon: PiggyBank,
    title: "Savings analytics",
    body: "Income minus expenses, savings rate, and goals — at a glance.",
  },
  {
    icon: LineChart,
    title: "Investment tracking",
    body: "Live portfolio value, P/L and ROI synced from your brokers.",
  },
];

export default function LandingPage() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      {/* Ambient brand glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, color-mix(in oklch, var(--primary) 22%, transparent), transparent 70%), radial-gradient(50% 40% at 85% 20%, color-mix(in oklch, var(--accent) 18%, transparent), transparent 70%)",
        }}
      />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-xl font-semibold tracking-tight">
          Zentry
        </span>
        <div className="flex items-center gap-2">
          <Button render={<Link href="/login" />} variant="ghost">
            Log in
          </Button>
          <Button render={<Link href="/signup" />}>Get started</Button>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <span className="border-border bg-card/60 text-muted-foreground mb-6 rounded-full border px-4 py-1.5 text-sm backdrop-blur">
          Your personal finance &amp; investment OS
        </span>
        <h1 className="font-display max-w-3xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
          Track every rupee.{" "}
          <span className="from-primary to-accent bg-gradient-to-r bg-clip-text text-transparent">
            Grow every investment.
          </span>
        </h1>
        <p className="text-muted-foreground mt-6 max-w-xl text-lg text-pretty">
          Zentry brings your expenses, savings, and stock portfolio into one
          clean, fast dashboard — with the analytics that actually matter.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button render={<Link href="/signup" />} size="lg">
            Start tracking
            <ArrowRight className="size-4" />
          </Button>
          <Button
            render={<Link href="/dashboard" />}
            size="lg"
            variant="outline"
          >
            View dashboard
          </Button>
        </div>

        <div className="mt-20 grid w-full gap-5 sm:grid-cols-3">
          {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="glass rounded-2xl p-6 text-left shadow-sm"
            >
              <div className="bg-primary/15 text-primary mb-4 flex size-10 items-center justify-center rounded-xl">
                <Icon className="size-5" />
              </div>
              <h3 className="font-medium">{title}</h3>
              <p className="text-muted-foreground mt-1.5 text-sm">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-muted-foreground mx-auto w-full max-w-6xl px-6 py-8 text-center text-sm">
        © 2026 Zentry. Built for personal use.
      </footer>
    </main>
  );
}
