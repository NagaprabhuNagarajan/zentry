import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import type { StockPrice } from "@/types/db";

type Client = SupabaseClient<Database>;

/** Latest cached prices for the given symbols (empty list → returns all). */
export async function listPrices(
  supabase: Client,
  symbols?: string[],
): Promise<StockPrice[]> {
  let query = supabase.from("stock_prices").select("*");
  if (symbols && symbols.length > 0) {
    query = query.in("symbol", symbols);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/** Upsert a single price. Service-role only (called from the price route/cron). */
export async function upsertPrice(
  supabase: Client,
  symbol: string,
  currentPrice: number,
  previousClose?: number | null,
): Promise<void> {
  const { error } = await supabase.from("stock_prices").upsert(
    {
      symbol,
      current_price: currentPrice,
      previous_close: previousClose ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "symbol" },
  );
  if (error) throw error;
}
