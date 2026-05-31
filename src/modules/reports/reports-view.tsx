"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  TrendingUp,
  Receipt,
  PiggyBank,
  Wallet,
  LineChart,
} from "lucide-react";
import { toast } from "sonner";

import { useMonthFilter } from "@/hooks/use-month-filter";
import { useMonthlyReport } from "@/modules/reports/use-report";
import { exportCsv, exportExcel } from "@/modules/reports/export";
import { formatCurrency, formatPercent } from "@/utils/format";

import { PageHeader } from "@/components/common/page-header";
import { MonthNavigator } from "@/components/common/month-navigator";
import { StatCard } from "@/components/common/stat-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export function ReportsView() {
  const { month, next, prev, isCurrentMonth } = useMonthFilter();
  const { report, isLoading } = useMonthlyReport(month);
  const [exporting, setExporting] = useState(false);

  async function handleExcel() {
    setExporting(true);
    try {
      await exportExcel(report);
    } catch {
      toast.error("Could not export Excel file");
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Reports"
        description="Monthly summaries and exports."
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button disabled={exporting} className="print:hidden" />}
            >
              <Download className="size-4" />
              Export
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportCsv(report)}>
                <FileText className="size-4" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExcel}>
                <FileSpreadsheet className="size-4" />
                Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.print()}>
                <Printer className="size-4" />
                PDF / Print
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <div className="mb-6 flex items-center justify-between print:hidden">
        <MonthNavigator
          month={month}
          onPrev={prev}
          onNext={next}
          disableNext={isCurrentMonth}
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      ) : (
        <div id="report" className="space-y-6">
          {/* Print-only header */}
          <div className="hidden print:block">
            <h1 className="text-2xl font-semibold">Zentry — {report.label}</h1>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Income"
              value={formatCurrency(report.income.total)}
              icon={TrendingUp}
            />
            <StatCard
              label="Expenses"
              value={formatCurrency(report.expenses.total)}
              icon={Receipt}
            />
            <StatCard
              label="Savings"
              value={formatCurrency(report.savings.amount)}
              hint={formatPercent(report.savings.rate)}
              tone={
                report.savings.amount > 0
                  ? "positive"
                  : report.savings.amount < 0
                    ? "negative"
                    : "default"
              }
              icon={PiggyBank}
            />
            <StatCard
              label="Portfolio value"
              value={formatCurrency(report.portfolio.currentValue)}
              icon={Wallet}
            />
            <StatCard
              label="Invested"
              value={formatCurrency(report.portfolio.invested)}
              icon={TrendingUp}
            />
            <StatCard
              label="Unrealized P&L"
              value={formatCurrency(report.portfolio.unrealizedGain)}
              hint={formatPercent(report.portfolio.returnPercent, {
                signed: true,
              })}
              tone={
                report.portfolio.unrealizedGain > 0
                  ? "positive"
                  : report.portfolio.unrealizedGain < 0
                    ? "negative"
                    : "default"
              }
              icon={LineChart}
            />
          </div>

          {report.expenses.byCategory.length > 0 ? (
            <ExpenseBreakdown data={report.expenses.byCategory} />
          ) : (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-base">Expense breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground py-10 text-center text-sm">
                  No expenses recorded for {report.label}.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </>
  );
}
