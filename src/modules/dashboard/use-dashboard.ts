"use client";

import { useQuery } from "@tanstack/react-query";

import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import { getLifetimeTotals } from "@/services/dashboard.service";

/** All-time savings total, used for the dashboard net-worth card. */
export function useLifetimeTotals() {
  return useQuery({
    queryKey: queryKeys.dashboard.lifetime,
    queryFn: () => getLifetimeTotals(createClient()),
  });
}
