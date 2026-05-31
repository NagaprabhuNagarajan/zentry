"use client";

import { useQuery } from "@tanstack/react-query";

import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import { listIncomeInRange } from "@/services/income.service";
import { listExpensesInRange } from "@/services/expenses.service";
import { calcSavings, calcSavingsRate } from "@/utils/finance";
import {
  formatMonthLabel,
  lastMonthKeys,
  monthRange,
  type MonthKey,
} from "@/utils/date";

export interface SavingsTrendPoint {
  month: MonthKey;
  label: string; // short label e.g. "May"
  income: number;
  expenses: number;
  savings: number;
  rate: number;
}

/** Monthly income/expenses/savings for the `months` months ending at `endMonth`. */
export function useSavingsTrend(endMonth: MonthKey, months = 6) {
  return useQuery({
    queryKey: queryKeys.savings.trend(endMonth, months),
    queryFn: async (): Promise<SavingsTrendPoint[]> => {
      const supabase = createClient();
      const keys = lastMonthKeys(months, endMonth);
      const start = monthRange(keys[0]).start;
      const end = monthRange(keys[keys.length - 1]).end;

      const [income, expenses] = await Promise.all([
        listIncomeInRange(supabase, start, end),
        listExpensesInRange(supabase, start, end),
      ]);

      const incomeByMonth = new Map<string, number>();
      for (const row of income) {
        const key = row.income_date.slice(0, 7);
        incomeByMonth.set(
          key,
          (incomeByMonth.get(key) ?? 0) + Number(row.amount),
        );
      }
      const expenseByMonth = new Map<string, number>();
      for (const row of expenses) {
        const key = row.expense_date.slice(0, 7);
        expenseByMonth.set(
          key,
          (expenseByMonth.get(key) ?? 0) + Number(row.amount),
        );
      }

      return keys.map((key) => {
        const inc = incomeByMonth.get(key) ?? 0;
        const exp = expenseByMonth.get(key) ?? 0;
        return {
          month: key,
          label: formatMonthLabel(key).split(" ")[0],
          income: inc,
          expenses: exp,
          savings: calcSavings(inc, exp),
          rate: calcSavingsRate(inc, exp),
        };
      });
    },
  });
}
