import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import type { Income, IncomeInsert, IncomeUpdate } from "@/types/db";
import { monthRange } from "@/utils/date";

type Client = SupabaseClient<Database>;

/** All income within a month (YYYY-MM), newest first. RLS scopes to the user. */
export async function listIncome(
  supabase: Client,
  month: string,
): Promise<Income[]> {
  const { start, end } = monthRange(month);
  const { data, error } = await supabase
    .from("income")
    .select("*")
    .gte("income_date", start)
    .lte("income_date", end)
    .order("income_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** Income rows between two ISO dates (inclusive) — used for trend aggregation. */
export async function listIncomeInRange(
  supabase: Client,
  start: string,
  end: string,
): Promise<Pick<Income, "amount" | "income_date">[]> {
  const { data, error } = await supabase
    .from("income")
    .select("amount, income_date")
    .gte("income_date", start)
    .lte("income_date", end);

  if (error) throw error;
  return data ?? [];
}

export async function createIncome(
  supabase: Client,
  input: IncomeInsert,
): Promise<Income> {
  const { data, error } = await supabase
    .from("income")
    .insert(input)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function updateIncome(
  supabase: Client,
  id: string,
  patch: IncomeUpdate,
): Promise<Income> {
  const { data, error } = await supabase
    .from("income")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteIncome(
  supabase: Client,
  id: string,
): Promise<void> {
  const { error } = await supabase.from("income").delete().eq("id", id);
  if (error) throw error;
}
