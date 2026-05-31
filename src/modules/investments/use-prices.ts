"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import { listPrices } from "@/services/prices.service";

export function usePrices(symbols: string[]) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.prices.all,
    queryFn: () => listPrices(createClient()),
  });

  // Live-refresh when the price-sync edge function (or a manual update) writes.
  useEffect(() => {
    if (symbols.length === 0) return;
    const supabase = createClient();
    const channel = supabase
      .channel("stock_prices_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "stock_prices" },
        () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.prices.all });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, symbols.length]);

  return query;
}

/** Manually set a symbol's price via the secured server route. */
export function useUpdatePrice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      symbol: string;
      price: number;
      previousClose?: number;
    }) => {
      const res = await fetch("/api/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to update price");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prices.all });
    },
  });
}
