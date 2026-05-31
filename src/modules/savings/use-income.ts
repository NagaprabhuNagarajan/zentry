"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import {
  createIncome,
  deleteIncome,
  listIncome,
  updateIncome,
} from "@/services/income.service";
import type { Income, IncomeUpdate } from "@/types/db";
import type { IncomeFormValues } from "@/lib/validations/income";

export function useIncome(month: string) {
  return useQuery({
    queryKey: queryKeys.income.list(month),
    queryFn: () => listIncome(createClient(), month),
  });
}

export function useCreateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: IncomeFormValues) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      return createIncome(supabase, {
        user_id: user.id,
        amount: values.amount,
        source: values.source,
        note: values.note?.trim() ? values.note.trim() : null,
        income_date: values.income_date,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.income.all });
    },
  });
}

export function useUpdateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: IncomeUpdate }) =>
      updateIncome(createClient(), id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.income.all });
    },
  });
}

export function useDeleteIncome(month: string) {
  const queryClient = useQueryClient();
  const listKey = queryKeys.income.list(month);

  return useMutation({
    mutationFn: (id: string) => deleteIncome(createClient(), id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const previous = queryClient.getQueryData<Income[]>(listKey);
      queryClient.setQueryData<Income[]>(listKey, (old) =>
        (old ?? []).filter((i) => i.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(listKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.income.all });
    },
  });
}
