# Deploying Zentry

Frontend → **Vercel**. Backend → **Supabase** (already provisioned; project ref
`qkosqtiwhthtvepwjezr`, all migrations applied).

---

## 1. Backend (Supabase) — mostly done

Already applied to the live project:

- Migrations `0001`–`0005` (schema, RLS, profile trigger, realtime, avatars bucket)
- Generated types in `src/types/database.types.ts`

Still to do in the **Supabase dashboard**:

1. **Auth → Providers → Email**: turn **off "Confirm email"** for instant login
   (personal app), or keep it on and confirm via email.
2. **Auth → URL Configuration**:
   - **Site URL**: `https://<your-vercel-domain>`
   - **Redirect URLs**: add `https://<your-vercel-domain>/**` (covers the
     `/reset-password` callback).

---

## 2. Frontend (Vercel)

### Environment variables (Project → Settings → Environment Variables)

| Name | Value | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://qkosqtiwhthtvepwjezr.supabase.co` | public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (anon key from `.env.local`) | public, RLS-safe |
| `SUPABASE_SERVICE_ROLE_KEY` | (service role key) | **server-only** — do NOT expose |

> Set the service-role key for **Production + Preview** only, never as
> `NEXT_PUBLIC_*`. It is used solely by the `/api/prices` and `/api/account`
> route handlers (server-side).

### Option A — Git integration (recommended)

```bash
git add -A
git commit -m "Initial Zentry build (M0–M10)"
git push -u origin main      # remote already set: NagaprabhuNagarajan/zentry
```

Then on vercel.com → **Add New → Project → Import** the `zentry` repo. Framework
auto-detects as Next.js. Add the env vars above → Deploy. Pushes to `main` then
auto-deploy.

### Option B — Vercel CLI

```bash
vercel login
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel --prod
```

No build config is needed — defaults work (`pnpm build`, output `.next`).

---

## 3. Stock price sync (optional, Investments automation)

Manual price updates work without this. To automate:

```bash
supabase functions deploy update-stock-prices
supabase secrets set CRON_SECRET=<random> STOCK_API_KEY=<twelve-data-key>
```

Then schedule it (see `supabase/functions/update-stock-prices/README.md`).
Broker auto-import (Zerodha Kite / Angel One) plugs in there once you add API
credentials.

---

## 4. Post-deploy smoke test

On the live URL:

1. Sign up → land on the dashboard (or confirm email if that's enabled).
2. Add an expense, income, and a holding; update a price.
3. Check the dashboard aggregates and the savings trend.
4. Export a report (CSV / Excel / PDF).
5. Update your profile + avatar in Settings.

## 5. Observability (nice to have)

- Vercel Analytics (Project → Analytics).
- Supabase logs (Dashboard → Logs) for the API routes / edge function.
