"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Percent,
  Target,
  Wallet,
} from "lucide-react";

import { useMonthFilter } from "@/hooks/use-month-filter";
import { useIncome } from "@/modules/savings/use-income";
import { useExpenses } from "@/modules/expenses/use-expenses";
import { useSavingsGoals } from "@/modules/savings/use-savings-goals";
import { useSavingsTrend } from "@/modules/savings/use-savings-trend";
import { IncomeFormDialog } from "@/modules/savings/income-form";
import { IncomeTable } from "@/modules/savings/income-table";
import { GoalFormDialog } from "@/modules/savings/goal-form";
import { GoalCard } from "@/modules/savings/goal-card";
import { calcSavings, calcSavingsRate } from "@/utils/finance";
import { formatCurrency, formatPercent } from "@/utils/format";

import { PageHeader } from "@/components/common/page-header";
import { MonthNavigator } from "@/components/common/month-navigator";
import { StatCard } from "@/components/common/stat-card";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SavingsBarChart = dynamic(
  () =>
    import("@/components/charts/savings-bar-chart").then(
      (m) => m.SavingsBarChart,
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-72 w-full rounded-xl" />,
  },
);

export function SavingsView() {
  const { month, next, prev, isCurrentMonth } = useMonthFilter();

  const { data: income = [], isLoading: incomeLoading } = useIncome(month);
  const { data: expenses = [] } = useExpenses(month);
  const { data: goals = [] } = useSavingsGoals();
  const { data: trend = [], isLoading: trendLoading } = useSavingsTrend(month);

  const totals = useMemo(() => {
    const incomeTotal = income.reduce((s, i) => s + Number(i.amount), 0);
    const expenseTotal = expenses.reduce((s, e) => s + Number(e.amount), 0);
    return {
      income: incomeTotal,
      expenses: expenseTotal,
      savings: calcSavings(incomeTotal, expenseTotal),
      rate: calcSavingsRate(incomeTotal, expenseTotal),
    };
  }, [income, expenses]);

  return (
    <>
      <PageHeader
        title="Savings"
        description="Income, savings rate, and goals."
        actions={
          <IncomeFormDialog
            trigger={
              <Button>
                <Plus className="size-4" />
                Add income
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
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Income"
          value={formatCurrency(totals.income)}
          icon={TrendingUp}
        />
        <StatCard
          label="Expenses"
          value={formatCurrency(totals.expenses)}
          icon={TrendingDown}
        />
        <StatCard
          label="Savings"
          value={formatCurrency(totals.savings)}
          tone={
            totals.savings > 0
              ? "positive"
              : totals.savings < 0
                ? "negative"
                : "default"
          }
          icon={PiggyBank}
        />
        <StatCard
          label="Savings rate"
          value={formatPercent(totals.rate)}
          tone={totals.rate >= 0 ? "positive" : "negative"}
          icon={Percent}
        />
      </div>

      {/* Trend */}
      <Card className="glass mb-6">
        <CardHeader>
          <CardTitle className="text-base">Last 6 months</CardTitle>
        </CardHeader>
        <CardContent>
          {trendLoading ? (
            <Skeleton className="h-72 w-full rounded-xl" />
          ) : (
            <SavingsBarChart data={trend} />
          )}
        </CardContent>
      </Card>

      {/* Goals */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Goals</h2>
        <GoalFormDialog
          trigger={
            <Button variant="outline" size="sm">
              <Plus className="size-4" />
              New goal
            </Button>
          }
        />
      </div>
      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals yet"
          description="Create a savings goal to track progress towards a target."
          className="mb-8"
        />
      ) : (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}

      {/* Income list */}
      <h2 className="font-display mb-4 text-lg font-semibold">
        Income this month
      </h2>
      {incomeLoading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : income.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No income this month"
          description="Add income to calculate your savings."
          action={
            <IncomeFormDialog
              trigger={
                <Button>
                  <Plus className="size-4" />
                  Add income
                </Button>
              }
            />
          }
        />
      ) : (
        <IncomeTable month={month} income={income} />
      )}
    </>
  );
}
