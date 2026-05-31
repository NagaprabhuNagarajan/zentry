"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { Plus, Receipt, Hash, Crown, Search } from "lucide-react";

import { useMonthFilter } from "@/hooks/use-month-filter";
import { useDebounce } from "@/hooks/use-debounce";
import { useExpenseFilters } from "@/store/expense.store";
import { useExpenses } from "@/modules/expenses/use-expenses";
import { computeExpenseAnalytics } from "@/modules/expenses/analytics";
import { ExpenseFormDialog } from "@/modules/expenses/expense-form";
import { ExpenseTable } from "@/modules/expenses/expense-table";
import { EXPENSE_CATEGORIES } from "@/constants/categories";
import { formatCurrency } from "@/utils/format";

import { PageHeader } from "@/components/common/page-header";
import { MonthNavigator } from "@/components/common/month-navigator";
import { StatCard } from "@/components/common/stat-card";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Lazy-load the chart bundle (Recharts) so it doesn't weigh down first paint.
const ExpenseBreakdown = dynamic(
  () =>
    import("@/modules/expenses/expense-breakdown").then(
      (m) => m.ExpenseBreakdown,
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-72 w-full rounded-xl" />,
  },
);

export function ExpensesView() {
  const { month, next, prev, isCurrentMonth } = useMonthFilter();
  const { category, search, setCategory, setSearch } = useExpenseFilters();
  const debouncedSearch = useDebounce(search, 250);

  const { data: expenses = [], isLoading } = useExpenses(month);

  const analytics = useMemo(
    () => computeExpenseAnalytics(expenses),
    [expenses],
  );

  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    return expenses.filter((e) => {
      const matchCategory = category === "all" || e.category === category;
      const matchSearch =
        !term ||
        e.note?.toLowerCase().includes(term) ||
        e.category.toLowerCase().includes(term);
      return matchCategory && matchSearch;
    });
  }, [expenses, category, debouncedSearch]);

  return (
    <>
      <PageHeader
        title="Expenses"
        description="Track and categorize your spending."
        actions={
          <ExpenseFormDialog
            month={month}
            trigger={
              <Button>
                <Plus className="size-4" />
                Add expense
              </Button>
            }
          />
        }
      />

      <div className="mb-6 flex items-center justify-between">
        <MonthNavigator
          month={month}
          onPrev={prev}
          onNext={next}
          disableNext={isCurrentMonth}
        />
      </div>

      {/* Summary */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total spent"
          value={formatCurrency(analytics.total)}
          icon={Receipt}
        />
        <StatCard
          label="Transactions"
          value={String(analytics.count)}
          icon={Hash}
        />
        <StatCard
          label="Top category"
          value={analytics.topCategory?.label ?? "—"}
          hint={
            analytics.topCategory
              ? formatCurrency(analytics.topCategory.total)
              : undefined
          }
          icon={Crown}
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No expenses this month"
          description="Add your first expense to start tracking your spending."
          action={
            <ExpenseFormDialog
              month={month}
              trigger={
                <Button>
                  <Plus className="size-4" />
                  Add expense
                </Button>
              }
            />
          }
        />
      ) : (
        <div className="space-y-6">
          {analytics.byCategory.length > 0 ? (
            <ExpenseBreakdown data={analytics.byCategory} />
          ) : null}

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes…"
                className="pl-8"
              />
            </div>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v ?? "all")}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {EXPENSE_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filtered.length > 0 ? (
            <ExpenseTable month={month} expenses={filtered} />
          ) : (
            <EmptyState
              title="No matching expenses"
              description="Try a different category or search term."
            />
          )}
        </div>
      )}
    </>
  );
}
