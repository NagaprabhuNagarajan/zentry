<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Zentry — Project Notes

Build plan: `IMPLEMENTATION_PLAN.md`. Product spec: `zentry_finance_app_development_docs.md`.

## Stack realities (verify before assuming)

- **Next.js 16** + React 19 + Tailwind **v4** (CSS-based config in
  `src/app/globals.css`; there is no `tailwind.config.js`).
- Shadcn UI here is the **Base UI** flavor: components use a **`render` prop**,
  NOT `asChild`. e.g. `<Button render={<Link href="..." />}>Label</Button>`.
- Package manager: **pnpm**.

## Conventions

- Currency/locale fixed to **INR / en-IN** — use helpers in `src/utils/format.ts`,
  never raw `toLocaleString`. Dates via `src/utils/date.ts`. Pure finance math in
  `src/utils/finance.ts` (keep side-effect free + unit-testable).
- Routes split into `(auth)` and `(app)` route groups under `src/app`.
- Theme tokens (cyan/purple/dark-navy, dark-first) live in `globals.css`; use
  semantic classes (`bg-primary`, `text-muted-foreground`, `.glass`), not raw hex.

## Verification gate (run before declaring a milestone done)

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

Pure calc utils (`finance`, `format`, `date`) and aggregation logic
(`expenses/analytics`, `investments/portfolio`) have Vitest coverage — keep it
green when changing them.

## Security invariants

- `stock_prices` and price/account writes go through server route handlers
  (`/api/prices`, `/api/account`) using the **service-role** admin client; never
  write those from the browser. The service-role key is `server-only` and must
  never appear in a client bundle (verified: 0 matches in `.next/static`).
- Every table is RLS-protected (`auth.uid() = user_id`). API routes re-check
  `auth.getUser()` and 401 before acting.
