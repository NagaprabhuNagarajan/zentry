# update-stock-prices

Daily price-sync job for the Investments module. **Scaffold — not yet deployed.**

## Deploy

```bash
supabase functions deploy update-stock-prices
supabase secrets set CRON_SECRET=<random-string> STOCK_API_KEY=<twelve-data-key>
```

## Schedule (Supabase Cron)

Run on market days (NSE/BSE, IST). Example: every 30 min, 09:00–16:00 IST
(03:30–10:30 UTC), Mon–Fri. In the Supabase dashboard → Integrations → Cron,
or via SQL with `pg_cron` + `pg_net`:

```sql
select cron.schedule(
  'sync-stock-prices',
  '*/30 4-10 * * 1-5',  -- UTC; adjust to market hours
  $$
  select net.http_post(
    url := 'https://<ref>.supabase.co/functions/v1/update-stock-prices',
    headers := jsonb_build_object('x-cron-secret', '<CRON_SECRET>')
  );
  $$
);
```

## Broker integration (next step)

Replace `fetchQuote` with the connected broker's quote endpoint once OAuth
tokens are stored in `broker_connections`:

- **Zerodha Kite Connect** — `access_token` expires daily ~6 AM IST; the cron
  must skip/flag expired sessions and prompt re-auth in the UI.
- **Angel One SmartAPI** — TOTP login with refreshable tokens.

Also write a daily `portfolio_snapshots` row per user to power the portfolio
growth chart.
