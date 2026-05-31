# Zentry — End-to-End Implementation Plan

A sequenced, milestone-based plan to build Zentry from an empty repo to a deployed,
fully usable personal finance tracker (Phase 1 MVP), with the on-ramp to Phase 2/3 features.

Each milestone lists **goals → tasks → deliverables → verification gate**. Do not advance
to the next milestone until the current verification gate passes.

---

## 0. Guiding Principles

- **Vertical slices over horizontal layers.** Ship one module fully (DB → service → store → UI → tested)
  before starting the next. This keeps the app runnable at every step.
- **Type safety end-to-end.** Generate DB types from Supabase; never hand-write row shapes.
- **Server-first.** Use React Server Components and Server Actions where possible; client components only
  where interactivity demands it (forms, charts, realtime).
- **RLS is the security boundary.** Every table is RLS-protected from day one. The anon key is safe to ship;
  the service-role key never touches the client bundle.
- **Migrations, not console clicks.** All schema changes live in versioned SQL migrations checked into git.

---

## Decisions to Confirm Before Coding

These choices materially shape the build. Defaults are proposed; confirm or override.

| Decision | Chosen | Notes |
|---|---|---|
| **Currency / locale** | **INR, `en-IN`** ✅ | Lakh/crore grouping, ₹ symbol. |
| **Stock market** | **NSE/BSE (India)** ✅ | User trades Indian equities. |
| **Price / holdings source** | **Broker APIs — Kite Connect (Zerodha) + Angel One SmartAPI** ✅ | User's brokers. These serve live quotes **and** can auto-import holdings, potentially replacing manual entry + any third-party price API. See "Broker integration" below. |
| **Auth method** | Supabase email + password | Magic link / OAuth can be added later. |
| **Package manager** | pnpm | Faster, stricter. Swap for npm if preferred. |
| **Deploy target** | Vercel (FE) + Supabase (BE) | As per docs. |

### Broker integration (Kite Connect + Angel One SmartAPI)

Because the user trades on **Zerodha (Kite)** and **Angel One**, the investment module should prefer broker
APIs over a generic stock-price API:

- **Holdings auto-import:** both APIs expose a holdings/positions endpoint → pull symbol, quantity, avg buy
  price directly, reducing/eliminating manual `InvestmentForm` entry.
- **Live quotes:** both expose LTP/quote endpoints → feed `stock_prices` instead of Twelve Data/Finnhub.
- **Important constraints to design around:**
  - **OAuth-style daily login.** Kite Connect uses a login flow that yields an `access_token` valid only
    until the next trading day (~6 AM IST) — it cannot run fully unattended without a periodic re-login.
    Angel One SmartAPI uses TOTP-based login with refreshable tokens. → The daily-update cron must account
    for token lifecycle; expect a manual/periodic broker re-auth step, or run price sync only while a valid
    session exists. Plan a graceful "connect your broker" + "session expired, reconnect" UX.
  - **Secrets:** API key/secret and access tokens are sensitive → store server-side only (Supabase
    secrets / encrypted column), never in the client bundle. Encrypt stored tokens at rest.
  - **Paid API:** Kite Connect has a monthly subscription; SmartAPI is free. Confirm which to wire first.
- **Fallback:** keep a generic price API (Twelve Data covers NSE/BSE) as an optional fallback for symbols
  not held at these brokers, or for users without broker access.

---

## Milestone 0 — Project Scaffolding & Tooling

**Goal:** A runnable Next.js app with all tooling, conventions, and the folder structure from the docs.

**Tasks**
1. Scaffold Next.js 15 (App Router) + React 19 + TypeScript (strict).
2. Install & init Tailwind CSS + Shadcn UI; add Lucide, Framer Motion, Recharts.
3. Install data/state libs: `@supabase/supabase-js`, `@tanstack/react-query`, `zustand`, `axios`,
   `react-hook-form`, `zod`.
4. Create the source tree (`app/`, `components/{common,charts,forms,layouts,ui}`, `modules/`, `hooks/`,
   `services/`, `store/`, `lib/`, `utils/`, `types/`, `constants/`, `styles/`).
5. Tooling: ESLint + Prettier + import sorting, `tsconfig` path aliases (`@/*`), Husky + lint-staged
   pre-commit hook, `.editorconfig`.
6. `.env.example` with the four env vars; `.env.local` gitignored.
7. Set up the theme tokens (cyan / purple / dark-navy), Inter + Geist fonts, dark-mode-first config.
8. `README.md` with run/setup instructions.

**Deliverables:** committed scaffold, `pnpm dev` serves a styled placeholder page.

**Verification gate:** `pnpm dev` runs clean, `pnpm build` succeeds, `pnpm lint` and `tsc --noEmit` pass.

---

## Milestone 1 — Supabase Backend (Schema, RLS, Auth)

**Goal:** A fully provisioned backend: tables, indexes, RLS, auth, typed.

**Tasks**
1. Create the Supabase project; capture URL + anon key + service-role key into env.
2. Set up the Supabase CLI; init local `supabase/` with migrations + local dev (Docker) for safe iteration.
3. Write migration `0001_init.sql`:
   - Tables: `expenses`, `income`, `stock_holdings`, `stock_prices`.
   - Use `auth.users` as the identity source; store `user_id uuid references auth.users(id)` on each
     user-owned table (drop the custom `users` table from the docs in favor of Supabase Auth's table, or
     add a `profiles` table that mirrors it via trigger for name/avatar). **Recommend `profiles`.**
   - Add a `savings_goals` table (the docs reference goal tracking but define no table).
   - Add `categories` support — start with a constant enum/check; optionally a `categories` table for
     custom categories later.
4. Indexes: `user_id`, all date columns (`expense_date`, `income_date`, `buy_date`), `stock_prices.symbol`.
5. Migration `0002_rls.sql`: enable RLS on every user table; `auth.uid() = user_id` policies for all
   CRUD. `stock_prices` is shared/read-only to clients (writes only via service role / edge function).
6. Migration `0003_profiles_trigger.sql`: trigger to auto-create a `profiles` row on signup.
7. Generate TypeScript types: `supabase gen types typescript` → `types/database.types.ts`.
8. Create the typed Supabase clients: browser client (anon) and server client (cookies/SSR), in `lib/`.

**Deliverables:** migrations in `supabase/migrations/`, generated DB types, working clients.

**Verification gate:** migrations apply cleanly to a fresh DB; a manual SQL insert as user A is invisible to
user B (RLS proven); types compile.

---

## Milestone 2 — App Shell, Theme & Auth Flows

**Goal:** Authenticated app shell with navigation, theme, and protected routes.

**Tasks**
1. Auth pages: `/login`, `/signup`, `/forgot-password`, `/reset-password` using Supabase Auth + RHF + zod.
2. Session handling: middleware to refresh sessions; protect all `(app)` routes; redirect unauthenticated
   users to `/login`. Session persistence across reloads.
3. `auth.store.ts` (Zustand) for client-side user/session state; server reads session from cookies.
4. App layout (`layouts/`): responsive sidebar + topbar, nav for Dashboard/Expenses/Savings/Investments/
   Reports/Settings, user menu (logout), dark-mode toggle.
5. Global providers: React Query client, theme provider, toast/sonner, error boundary.
6. Common UI primitives in `components/ui` (via Shadcn) + `components/common` (StatCard, SummaryCard,
   ProfitCard, PageHeader, EmptyState, LoadingSkeletons).

**Deliverables:** working signup→login→logout cycle, protected dashboard placeholder, responsive shell.

**Verification gate:** full auth round-trip works; refreshing a protected page keeps you logged in;
logged-out access redirects; mobile layout is usable.

---

## Milestone 3 — Data Layer Foundation

**Goal:** Reusable, typed data access + state patterns the feature modules will build on.

**Tasks**
1. Service layer (`services/*.service.ts`): typed CRUD wrappers over Supabase, centralized error handling,
   consistent return shapes. One file per domain (expenses, income, investments, dashboard, reports).
2. React Query setup: query keys factory, default options (staleTime, retry), optimistic-update helpers,
   error/toast integration.
3. Shared hooks (`hooks/`): `useMonthFilter`, `useSupabaseQuery`/`useSupabaseMutation` wrappers,
   `useDebounce`, `useRealtime` (subscribe to table changes).
4. Domain types (`types/`) derived from `database.types.ts` + computed view models.
5. Utilities (`utils/`): currency formatting (locale-aware), date helpers (month ranges, formatting),
   number/percent formatting, calculation helpers (savings, ROI, P/L).
6. Constants (`constants/`): categories list, payment methods, income sources, chart colors, nav config.

**Deliverables:** the plumbing each module imports.

**Verification gate:** a throwaway test page can create/read an expense through the service+query layer and
see it update optimistically; realtime hook receives a change event.

---

## Milestone 4 — Expenses Module (first full vertical slice)

**Goal:** Complete expense management, end to end.

**Tasks**
1. `ExpenseForm` (create/edit): amount, category, note, date, payment method — RHF + zod validation.
2. `ExpenseTable`: paginated/sortable list; row edit + delete with confirm; optimistic updates.
3. Filters: by month, by category, free-text search (debounced); empty/loading/error states.
4. Monthly analytics for expenses: total, by-category breakdown, count.
5. `ExpensePieChart` (category breakdown) — lazy-loaded.
6. `expense.store.ts` for UI-only state (active filters, selected month).
7. Mobile-first layout polish + Framer Motion list transitions.

**Deliverables:** `/expenses` page fully functional.

**Verification gate:** create/edit/delete/filter/search all work against Supabase with RLS; data persists;
charts reflect live data; works on mobile.

---

## Milestone 5 — Savings & Income Module

**Goal:** Income tracking + savings analytics + goals.

**Tasks**
1. `IncomeForm` + income list/CRUD (amount, source, date, note) — mirrors expenses patterns.
2. Savings computation: `Savings = Income − Expenses` per month; savings ratio = savings / income.
3. Savings analytics: monthly savings, savings-rate trend, `SavingsBarChart` (monthly), trend line.
4. Goal tracking: `savings_goals` CRUD, progress bars, target vs actual.
5. `savings.store.ts` for filters/selection.

**Deliverables:** `/savings` page functional with income CRUD, savings metrics, goals.

**Verification gate:** savings math is correct across month boundaries; ratios/percentages format right;
goals update; charts match the numbers.

---

## Milestone 6 — Investments Module + Stock Price Pipeline

**Goal:** Holdings management + automated daily prices + P/L metrics. (Most complex milestone.)

**Broker-first approach (Kite Connect + Angel One SmartAPI).** Prefer pulling holdings + quotes from the
user's brokers over manual entry / generic price APIs. Build broker connect as its own sub-step first.

**Tasks**
1. **Broker connection UX + secrets:** `broker_connections` table (provider, encrypted tokens, expiry,
   status). "Connect Zerodha / Angel One" flow → store tokens server-side (Supabase secrets / encrypted
   column). Handle "session expired → reconnect" state (Kite token expires daily ~6 AM IST).
2. **Holdings sync** Edge Function: pull holdings/positions from the connected broker(s) → upsert
   `stock_holdings` (symbol, quantity, avg buy price, broker). Manual `InvestmentForm` remains as a
   fallback for non-broker holdings.
3. **Quote sync** Edge Function `update-stock-prices`: fetch LTP for held symbols from the broker quote
   endpoint (fallback: Twelve Data for uncovered symbols) → upsert `stock_prices`. Secured: service role,
   tokens read server-side, not publicly invocable without a secret.
4. Metrics: current value, unrealized gain, daily P/L, ROI %, total invested, portfolio value.
5. `InvestmentTable` + `PortfolioLineChart` (needs `portfolio_snapshots` for history — write a daily
   snapshot from the cron; add migration).
6. **Cron job** (Supabase scheduled trigger) on a market-hours schedule, token lifecycle aware (skip/flag
   when the broker session is expired rather than failing hard).
7. **Realtime**: subscribe the investments UI to `stock_prices` changes for live value refresh.
8. Rate-limit / retry / error handling per broker; handle unknown or delisted symbols gracefully.

**Deliverables:** `/investments` page with broker connect, auto-imported holdings, live-updating portfolio;
deployed edge functions + cron.

**Verification gate:** connect a broker → holdings auto-import → quotes populate → cron run updates prices →
UI updates via realtime; P/L and ROI verified against a hand calculation; expired-session state shows a
clear reconnect prompt instead of erroring.

> **Open item:** historical portfolio growth needs stored snapshots. Decide: add a daily
> `portfolio_snapshots` write to the cron job (recommended) or compute from price history.

---

## Milestone 7 — Dashboard

**Goal:** The aggregate overview tying all modules together.

**Tasks**
1. `dashboard.service.ts`: aggregate queries (current-month totals, balances, portfolio value, P/L,
   savings rate). Prefer Postgres views or RPC functions for efficient server-side aggregation.
2. Overview cards: Total Balance, Monthly Expenses, Monthly Savings, Portfolio Value, Profit/Loss,
   Savings Rate (`StatCard`/`ProfitCard`).
3. Charts: expense breakdown, monthly trends, savings growth, portfolio growth (lazy-loaded).
4. Widgets: top spending category, recent expenses, investment summary, current-month analytics.
5. `dashboard.store.ts` if needed for selected period.

**Deliverables:** `/dashboard` page as the app's home.

**Verification gate:** every card/widget matches the source module's numbers; aggregations are efficient
(no N+1 client fetches — measured); loads fast with skeletons.

---

## Milestone 8 — Reports & Export

**Goal:** Monthly reports with visual summaries and file export.

**Tasks**
1. `reports.service.ts`: monthly report data (expense summary, savings summary, investment performance,
   P/L summary) for a chosen month/range.
2. Report UI: month/range selector, visual reports (pie/bar/line), printable layout.
3. Export: CSV (papaparse), Excel (sheetjs/exceljs), PDF (react-pdf or server-side render-to-PDF).
4. Server Action or Edge Function for heavier export generation if client-side is too slow.

**Deliverables:** `/reports` page with working PDF/CSV/Excel export.

**Verification gate:** exported files open correctly and contain accurate data for the selected period;
charts render in the PDF.

---

## Milestone 9 — Settings

**Goal:** Account + app preferences.

**Tasks**
1. Profile (name, email, avatar via Supabase Storage), password change.
2. Preferences: currency/locale, theme, default category list / custom categories.
3. Data management: export-all, delete-account (with confirmation).

**Deliverables:** `/settings` page.

**Verification gate:** profile updates persist; password change works; avatar upload to Storage works with
correct access rules.

---

## Milestone 10 — Quality, Performance, Security Hardening

**Goal:** Production readiness.

**Tasks**
1. **Testing:** unit tests for calc utils (savings, ROI, P/L, formatters) with Vitest; component tests
   (React Testing Library) for forms; E2E happy paths (Playwright): signup → add expense/income/holding →
   see dashboard → export report.
2. **Performance:** lazy-load all charts, memoize expensive calcs, verify RSC usage, optimistic updates,
   bundle analysis, image optimization, DB query/index review (`EXPLAIN`).
3. **Security review:** confirm service-role key absent from client bundle, RLS on every table, input
   validation (zod) on all writes, sanitize free-text notes, restrict/secure edge functions, set security
   headers/CSP. Run the `/security-review` skill on the diff.
4. **A11y & UX:** keyboard nav, focus states, contrast (use the a11y-debugging skill), loading/empty/error
   states everywhere, responsive pass on all pages.

**Verification gate:** test suite green; Lighthouse performance + a11y acceptable; security checklist signed
off; RLS bypass attempts fail.

---

## Milestone 11 — Deployment

**Goal:** Live app.

**Tasks**
1. Supabase: apply migrations to the production project; deploy edge function; configure cron + secrets.
2. Vercel: connect repo, set env vars (anon key + URL public; service role only in server/edge scope),
   configure build, set up preview deploys.
3. Configure Supabase Auth redirect URLs for the production domain.
4. Smoke test production: full user journey on the live URL.
5. Add basic observability: Vercel analytics, Supabase logs, edge-function error alerts.

**Verification gate:** a brand-new user can sign up on production and complete the full journey; the daily
price cron runs successfully in prod.

---

## Post-MVP (Phase 2 → 3) — Backlog

Sequenced for after MVP ships:

- **Phase 2:** budget alerts, recurring expenses, CSV import, monthly summary notifications (email/edge
  function + cron), AI insights, advanced analytics.
- **Phase 3:** UPI import, SMS parsing, mutual funds, family/shared accounts, AI financial assistant,
  mobile app (React Native or Flutter reusing the Supabase backend + shared business logic).

---

## Suggested Sequencing Summary

```
M0 Scaffold ─► M1 Backend ─► M2 Auth/Shell ─► M3 Data Layer
                                                   │
        ┌──────────────────────────────────────────┘
        ▼
M4 Expenses ─► M5 Savings ─► M6 Investments ─► M7 Dashboard ─► M8 Reports ─► M9 Settings
                                                   │
                                                   ▼
                                   M10 Hardening ─► M11 Deploy ─► Phase 2/3
```

Modules M4–M6 are independent vertical slices and *could* be parallelized, but building them in order keeps
the dashboard (M7) data dependencies satisfied and the app demoable throughout.
```
