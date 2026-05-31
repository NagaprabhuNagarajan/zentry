import type { Expense } from "@/types/db";
import { getCategoryMeta } from "@/constants/categories";

export interface CategoryBreakdown {
  category: string;
  label: string;
  color: string;
  total: number;
  percent: number;
}

export interface ExpenseAnalytics {
  total: number;
  count: number;
  byCategory: CategoryBreakdown[];
  topCategory: CategoryBreakdown | null;
}

/** Aggregate a month's expenses into totals + category breakdown (desc). */
export function computeExpenseAnalytics(expenses: Expense[]): ExpenseAnalytics {
  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const totalsByCategory = new Map<string, number>();
  for (const e of expenses) {
    totalsByCategory.set(
      e.category,
      (totalsByCategory.get(e.category) ?? 0) + Number(e.amount),
    );
  }

  const byCategory: CategoryBreakdown[] = Array.from(totalsByCategory.entries())
    .map(([category, catTotal]) => {
      const meta = getCategoryMeta(category);
      return {
        category,
        label: meta?.label ?? category,
        color: meta?.color ?? "var(--chart-3)",
        total: catTotal,
        percent: total > 0 ? (catTotal / total) * 100 : 0,
      };
    })
    .sort((a, b) => b.total - a.total);

  return {
    total,
    count: expenses.length,
    byCategory,
    topCategory: byCategory[0] ?? null,
  };
}
