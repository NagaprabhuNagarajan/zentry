"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import {
  createGoal,
  deleteGoal,
  listGoals,
  updateGoal,
} from "@/services/savings-goals.service";
import type { SavingsGoalUpdate } from "@/types/db";
import type { SavingsGoalFormValues } from "@/lib/validations/savings-goal";

export function useSavingsGoals() {
  return useQuery({
    queryKey: queryKeys.savingsGoals.all,
    queryFn: () => listGoals(createClient()),
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: SavingsGoalFormValues) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      return createGoal(supabase, {
        user_id: user.id,
        name: values.name.trim(),
        target_amount: values.target_amount,
        saved_amount: values.saved_amount,
        target_date: values.target_date || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals.all });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: SavingsGoalUpdate }) =>
      updateGoal(createClient(), id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals.all });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGoal(createClient(), id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals.all });
    },
  });
}
