"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Wallet,
  Receipt,
  PiggyBank,
  TrendingUp,
  LineChart,
  Percent,
} from "lucide-react";

import { useMonthFilter } from "@/hooks/use-month-filter";
import { useExpenses } from "@/modules/expenses/use-expenses";
import { useIncome } from "@/modules/savings/use-income";
import { useHoldings } from "@/modules/investments/use-holdings";
import { usePrices } from "@/modules/investments/use-prices";
import { useSavingsTrend } from "@/modules/savings/use-savings-trend";
import { useLifetimeTotals } from "@/modules/dashboard/use-dashboard";
import { computeExpenseAnalytics } from "@/modules/expenses/analytics";
import { buildPortfolio } from "@/modules/investments/portfolio";
import { RecentExpenses } from "@/modules/dashboard/recent-expenses";
import { InvestmentSummary } from "@/modules/dashboard/investment-summary";
import { calcSavings, calcSavingsRate } from "@/utils/finance";
import { formatCurrency, formatPercent } from "@/utils/format";

import { PageHeader } from "@/components/common/page-header";
import { MonthNavigator } from "@/components/common/month-navigator";
import { StatCard } from "@/components/common/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export function DashboardView() {
  const { month, next, prev, isCurrentMonth } = useMonthFilter();

  const { data: expenses = [] } = useExpenses(month);
  const { data: income = [] } = useIncome(month);
  const { data: holdings = [] } = useHoldings();
  const symbols = useMemo(
    () => Array.from(new Set(holdings.map((h) => h.symbol))),
    [holdings],
  );
  const { data: prices = [] } = usePrices(symbols);
  const { data: trend = [] } = useSavingsTrend(month);
  const { data: lifetime } = useLifetimeTotals();

  const analytics = useMemo(
    () => computeExpenseAnalytics(expenses),
    [expenses],
  );
  const portfolio = useMemo(
    () => buildPortfolio(holdings, prices),
    [holdings, prices],
  );

  const monthIncome = useMemo(
    () => income.reduce((s, i) => s + Number(i.amount), 0),
    [income],
  );
  const monthSavings = calcSavings(monthIncome, analytics.total);
  const savingsRate = calcSavingsRate(monthIncome, analytics.total);
  const netWorth = (lifetime?.savings ?? 0) + portfolio.currentValue;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your financial overview at a glance."
      />

      <div className="mb-6 flex items-center justify-between">
        <MonthNavigator
          month={month}
          onPrev={prev}
          onNext={next}
          disableNext={isCurrentMonth}
        />
      </div>

      {/* Overview cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total balance"
          value={formatCurrency(netWorth)}
          hint="Cash savings + portfolio"
          icon={Wallet}
        />
        <StatCard
          label="Portfolio value"
          value={formatCurrency(portfolio.currentValue)}
          hint={formatPercent(portfolio.returnPercent, { signed: true })}
          icon={TrendingUp}
        />
        <StatCard
          label="Unrealized P&L"
          value={formatCurrency(portfolio.unrealizedGain)}
          tone={
            portfolio.unrealizedGain > 0
              ? "positive"
              : portfolio.unrealizedGain < 0
                ? "negative"
                : "default"
          }
          icon={LineChart}
        />
        <StatCard
          label="Monthly expenses"
          value={formatCurrency(analytics.total)}
          icon={Receipt}
        />
        <StatCard
          label="Monthly savings"
          value={formatCurrency(monthSavings)}
          tone={
            monthSavings > 0
              ? "positive"
              : monthSavings < 0
                ? "negative"
                : "default"
          }
          icon={PiggyBank}
        />
        <StatCard
          label="Savings rate"
          value={formatPercent(savingsRate)}
          tone={savingsRate >= 0 ? "positive" : "negative"}
          icon={Percent}
        />
      </div>

      {/* Charts */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        {analytics.byCategory.length > 0 ? (
          <ExpenseBreakdown data={analytics.byCategory} />
        ) : (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base">Category breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground py-12 text-center text-sm">
                No expenses to break down this month.
              </p>
            </CardContent>
          </Card>
        )}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-base">Savings · last 6 months</CardTitle>
          </CardHeader>
          <CardContent>
            <SavingsBarChart data={trend} />
          </CardContent>
        </Card>
      </div>

      {/* Widgets */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RecentExpenses expenses={expenses} />
        <InvestmentSummary portfolio={portfolio} />
      </div>
    </>
  );
}
