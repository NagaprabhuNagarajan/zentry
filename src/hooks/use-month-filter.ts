"use client";

import { useCallback, useMemo, useState } from "react";
import { addMonths, parseISO } from "date-fns";
import { toMonthKey, type MonthKey } from "@/utils/date";

/**
 * Manages the active month (YYYY-MM) for month-scoped views, with prev/next
 * navigation. Initializes to the current month on the client.
 */
export function useMonthFilter(initial?: MonthKey) {
  const [month, setMonth] = useState<MonthKey>(
    () => initial ?? toMonthKey(new Date()),
  );

  const shift = useCallback((delta: number) => {
    setMonth((current) =>
      toMonthKey(addMonths(parseISO(`${current}-01`), delta)),
    );
  }, []);

  const isCurrentMonth = useMemo(
    () => month === toMonthKey(new Date()),
    [month],
  );

  return {
    month,
    setMonth,
    next: () => shift(1),
    prev: () => shift(-1),
    isCurrentMonth,
  };
}
