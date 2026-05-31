"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import {
  createExpense,
  deleteExpense,
  listExpenses,
  updateExpense,
} from "@/services/expenses.service";
import type { Expense, ExpenseUpdate } from "@/types/db";
import type { ExpenseFormValues } from "@/lib/validations/expense";

export function useExpenses(month: string) {
  return useQuery({
    queryKey: queryKeys.expenses.list(month),
    queryFn: () => listExpenses(createClient(), month),
  });
}

export function useCreateExpense(month: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: ExpenseFormValues) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      return createExpense(supabase, {
        user_id: user.id,
        amount: values.amount,
        category: values.category,
        payment_method: values.payment_method ?? null,
        note: values.note?.trim() ? values.note.trim() : null,
        expense_date: values.expense_date,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.expenses.list(month),
      });
    },
  });
}

export function useUpdateExpense(month: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: ExpenseUpdate }) =>
      updateExpense(createClient(), id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.expenses.list(month),
      });
    },
  });
}

export function useDeleteExpense(month: string) {
  const queryClient = useQueryClient();
  const listKey = queryKeys.expenses.list(month);

  return useMutation({
    mutationFn: (id: string) => deleteExpense(createClient(), id),
    // Optimistic remove for a snappy list.
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const previous = queryClient.getQueryData<Expense[]>(listKey);
      queryClient.setQueryData<Expense[]>(listKey, (old) =>
        (old ?? []).filter((e) => e.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous)
        queryClient.setQueryData(listKey, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listKey });
    },
  });
}
