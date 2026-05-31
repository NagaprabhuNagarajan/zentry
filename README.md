# Zentry — Personal Finance & Investment Tracker

A modern personal finance dashboard: expense tracking, savings analytics, and
stock investment tracking with profit/loss analysis and monthly reports.

> Currency/locale: **INR / en-IN**. Stock market: **NSE/BSE** with broker
> integration (Zerodha Kite Connect + Angel One SmartAPI).

## Tech Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript** (strict)
- **Tailwind CSS v4** · **Shadcn UI** (Base UI) · **Lucide** · **Framer Motion**
- **Zustand** (client state) · **TanStack Query** + **Axios** (data) · **Recharts**
- **React Hook Form** + **Zod** (forms/validation)
- **Supabase** — Postgres, Auth, RLS, Edge Functions, Realtime, Storage, Cron

## Getting Started

```bash
pnpm install
cp .env.example .env.local   # fill in Supabase keys
pnpm dev                     # http://localhost:3000
```

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Run the Vitest unit suite |
| `pnpm format` | Prettier write |

## Environment Variables

See [.env.example](.env.example). `NEXT_PUBLIC_*` keys are browser-safe
(protected by RLS); `SUPABASE_SERVICE_ROLE_KEY` and broker secrets are
**server-only** and must never be exposed to the client.

## Project Structure

```
src/
 ├── app/            # routes: (auth) + (app) groups
 ├── components/     # ui (shadcn), common, charts, forms, layouts
 ├── modules/        # per-domain feature logic
 ├── services/       # typed Supabase data access
 ├── store/          # Zustand stores
 ├── hooks/ lib/ utils/ types/ constants/
supabase/
 ├── migrations/     # versioned SQL
 └── functions/      # edge functions
```

## Roadmap

The full end-to-end build plan lives in
[IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md). Product spec:
[zentry_finance_app_development_docs.md](zentry_finance_app_development_docs.md).
