"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import {
  createHolding,
  deleteHolding,
  listHoldings,
  updateHolding,
} from "@/services/holdings.service";
import type { StockHolding, StockHoldingUpdate } from "@/types/db";
import type { HoldingFormValues } from "@/lib/validations/holding";

export function useHoldings() {
  return useQuery({
    queryKey: queryKeys.holdings.all,
    queryFn: () => listHoldings(createClient()),
  });
}

export function useCreateHolding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: HoldingFormValues) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      return createHolding(supabase, {
        user_id: user.id,
        symbol: values.symbol.trim().toUpperCase(),
        quantity: values.quantity,
        buy_price: values.buy_price,
        buy_date: values.buy_date,
        broker: values.broker ?? null,
        source: "manual",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.holdings.all });
    },
  });
}

export function useUpdateHolding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: StockHoldingUpdate }) =>
      updateHolding(createClient(), id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.holdings.all });
    },
  });
}

export function useDeleteHolding() {
  const queryClient = useQueryClient();
  const key = queryKeys.holdings.all;

  return useMutation({
    mutationFn: (id: string) => deleteHolding(createClient(), id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<StockHolding[]>(key);
      queryClient.setQueryData<StockHolding[]>(key, (old) =>
        (old ?? []).filter((h) => h.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}
