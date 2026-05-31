import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import type { Expense, ExpenseInsert, ExpenseUpdate } from "@/types/db";
import { monthRange } from "@/utils/date";

type Client = SupabaseClient<Database>;

/** All expenses within a month (YYYY-MM), newest first. RLS scopes to the user. */
export async function listExpenses(
  supabase: Client,
  month: string,
): Promise<Expense[]> {
  const { start, end } = monthRange(month);
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .gte("expense_date", start)
    .lte("expense_date", end)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** Expense rows between two ISO dates (inclusive) — used for trend aggregation. */
export async function listExpensesInRange(
  supabase: Client,
  start: string,
  end: string,
): Promise<Pick<Expense, "amount" | "expense_date">[]> {
  const { data, error } = await supabase
    .from("expenses")
    .select("amount, expense_date")
    .gte("expense_date", start)
    .lte("expense_date", end);

  if (error) throw error;
  return data ?? [];
}

export async function createExpense(
  supabase: Client,
  input: ExpenseInsert,
): Promise<Expense> {
  const { data, error } = await supabase
    .from("expenses")
    .insert(input)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function updateExpense(
  supabase: Client,
  id: string,
  patch: ExpenseUpdate,
): Promise<Expense> {
  const { data, error } = await supabase
    .from("expenses")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteExpense(
  supabase: Client,
  id: string,
): Promise<void> {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
}
