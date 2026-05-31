import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

export interface LifetimeTotals {
  income: number;
  expenses: number;
  /** Cumulative cash savings across all time (income − expenses). */
  savings: number;
}

/**
 * All-time income and expense totals, for the dashboard's net-worth figure.
 * Personal-scale data, so we sum client-side; if volume ever grows this can be
 * replaced by a Postgres view or RPC without touching callers.
 */
export async function getLifetimeTotals(
  supabase: Client,
): Promise<LifetimeTotals> {
  const [incomeRes, expenseRes] = await Promise.all([
    supabase.from("income").select("amount"),
    supabase.from("expenses").select("amount"),
  ]);
  if (incomeRes.error) throw incomeRes.error;
  if (expenseRes.error) throw expenseRes.error;

  const income = (incomeRes.data ?? []).reduce(
    (sum, r) => sum + Number(r.amount),
    0,
  );
  const expenses = (expenseRes.data ?? []).reduce(
    (sum, r) => sum + Number(r.amount),
    0,
  );
  return { income, expenses, savings: income - expenses };
}
