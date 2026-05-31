"use client";

import { useMemo } from "react";

import { useExpenses } from "@/modules/expenses/use-expenses";
import { useIncome } from "@/modules/savings/use-income";
import { useHoldings } from "@/modules/investments/use-holdings";
import { usePrices } from "@/modules/investments/use-prices";
import {
  computeExpenseAnalytics,
  type CategoryBreakdown,
} from "@/modules/expenses/analytics";
import {
  buildPortfolio,
  type PortfolioSummary,
} from "@/modules/investments/portfolio";
import { calcSavings, calcSavingsRate } from "@/utils/finance";
import { formatMonthLabel } from "@/utils/date";
import type { Expense, Income } from "@/types/db";

export interface MonthlyReport {
  month: string;
  label: string;
  income: { total: number; items: Income[] };
  expenses: {
    total: number;
    byCategory: CategoryBreakdown[];
    items: Expense[];
  };
  savings: { amount: number; rate: number };
  portfolio: PortfolioSummary;
}

/** Assembles a full monthly report from the existing module queries. */
export function useMonthlyReport(month: string) {
  const expensesQuery = useExpenses(month);
  const incomeQuery = useIncome(month);
  const holdingsQuery = useHoldings();
  const holdings = useMemo(
    () => holdingsQuery.data ?? [],
    [holdingsQuery.data],
  );
  const symbols = useMemo(
    () => Array.from(new Set(holdings.map((h) => h.symbol))),
    [holdings],
  );
  const pricesQuery = usePrices(symbols);

  const isLoading =
    expensesQuery.isLoading || incomeQuery.isLoading || holdingsQuery.isLoading;

  const report = useMemo<MonthlyReport>(() => {
    const expenses = expensesQuery.data ?? [];
    const income = incomeQuery.data ?? [];
    const prices = pricesQuery.data ?? [];

    const analytics = computeExpenseAnalytics(expenses);
    const incomeTotal = income.reduce((s, i) => s + Number(i.amount), 0);
    const portfolio = buildPortfolio(holdings, prices);

    return {
      month,
      label: formatMonthLabel(month),
      income: { total: incomeTotal, items: income },
      expenses: {
        total: analytics.total,
        byCategory: analytics.byCategory,
        items: expenses,
      },
      savings: {
        amount: calcSavings(incomeTotal, analytics.total),
        rate: calcSavingsRate(incomeTotal, analytics.total),
      },
      portfolio,
    };
  }, [month, expensesQuery.data, incomeQuery.data, pricesQuery.data, holdings]);

  return { report, isLoading };
}
