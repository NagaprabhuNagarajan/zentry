import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import type {
  StockHolding,
  StockHoldingInsert,
  StockHoldingUpdate,
} from "@/types/db";

type Client = SupabaseClient<Database>;

export async function listHoldings(supabase: Client): Promise<StockHolding[]> {
  const { data, error } = await supabase
    .from("stock_holdings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createHolding(
  supabase: Client,
  input: StockHoldingInsert,
): Promise<StockHolding> {
  const { data, error } = await supabase
    .from("stock_holdings")
    .insert(input)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function updateHolding(
  supabase: Client,
  id: string,
  patch: StockHoldingUpdate,
): Promise<StockHolding> {
  const { data, error } = await supabase
    .from("stock_holdings")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteHolding(
  supabase: Client,
  id: string,
): Promise<void> {
  const { error } = await supabase.from("stock_holdings").delete().eq("id", id);
  if (error) throw error;
}
