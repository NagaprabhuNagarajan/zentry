import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import type {
  SavingsGoal,
  SavingsGoalInsert,
  SavingsGoalUpdate,
} from "@/types/db";

type Client = SupabaseClient<Database>;

export async function listGoals(supabase: Client): Promise<SavingsGoal[]> {
  const { data, error } = await supabase
    .from("savings_goals")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createGoal(
  supabase: Client,
  input: SavingsGoalInsert,
): Promise<SavingsGoal> {
  const { data, error } = await supabase
    .from("savings_goals")
    .insert(input)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function updateGoal(
  supabase: Client,
  id: string,
  patch: SavingsGoalUpdate,
): Promise<SavingsGoal> {
  const { data, error } = await supabase
    .from("savings_goals")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteGoal(supabase: Client, id: string): Promise<void> {
  const { error } = await supabase.from("savings_goals").delete().eq("id", id);
  if (error) throw error;
}
