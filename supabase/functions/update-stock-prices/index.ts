// Supabase Edge Function: update-stock-prices
// ────────────────────────────────────────────────────────────────────────────
// Scaffold for the daily price-sync job (Milestone 6 automation).
//
// Trigger: Supabase Cron on a market-hours schedule (see README of this dir).
// Auth:    require a shared secret header so it can't be invoked publicly.
// Flow:    distinct held symbols → fetch quotes → upsert public.stock_prices.
//
// Price source is pluggable. The default below uses a generic provider
// (Twelve Data, which covers NSE/BSE). Broker integration (Zerodha Kite /
// Angel One SmartAPI) plugs in at `fetchQuote` once OAuth tokens are stored in
// `broker_connections` — see the note at the bottom.
//
// Deploy:
//   supabase functions deploy update-stock-prices
//   supabase secrets set CRON_SECRET=... STOCK_API_KEY=...
//
// Deno runtime — not part of the Next.js build/typecheck.

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STOCK_API_KEY = Deno.env.get("STOCK_API_KEY") ?? "";
const CRON_SECRET = Deno.env.get("CRON_SECRET") ?? "";

interface Quote {
  symbol: string;
  price: number;
  previousClose?: number;
}

/** Fetch a single quote from the generic provider. Swap for a broker API later. */
async function fetchQuote(symbol: string): Promise<Quote | null> {
  if (!STOCK_API_KEY) return null;
  // Twelve Data: exchange suffix for NSE is `:NSE`.
  const url =
    `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}` +
    `&apikey=${STOCK_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const price = Number(data?.close ?? data?.price);
  if (!Number.isFinite(price)) return null;
  return {
    symbol,
    price,
    previousClose: Number(data?.previous_close) || undefined,
  };
}

Deno.serve(async (req) => {
  // Reject public invocations.
  if (req.headers.get("x-cron-secret") !== CRON_SECRET || !CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // Distinct symbols across all users' holdings.
  const { data: holdings, error } = await supabase
    .from("stock_holdings")
    .select("symbol");
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  const symbols = [...new Set((holdings ?? []).map((h) => h.symbol))];
  let updated = 0;

  for (const symbol of symbols) {
    const quote = await fetchQuote(symbol);
    if (!quote) continue;
    const { error: upsertError } = await supabase.from("stock_prices").upsert(
      {
        symbol: quote.symbol,
        current_price: quote.price,
        previous_close: quote.previousClose ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "symbol" },
    );
    if (!upsertError) updated += 1;
  }

  // TODO(broker): replace fetchQuote with broker quote endpoints once tokens are
  // stored in `broker_connections`:
  //   - Zerodha Kite Connect: GET /quote/ltp (access_token expires ~6 AM IST).
  //   - Angel One SmartAPI: market data endpoints (TOTP-refreshable tokens).
  // Also write a daily row to `portfolio_snapshots` per user for the growth
  // chart, and skip/flag when a broker session is expired rather than failing.

  return new Response(JSON.stringify({ symbols: symbols.length, updated }), {
    headers: { "Content-Type": "application/json" },
  });
});
