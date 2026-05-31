"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { Plus, TrendingUp, Wallet, LineChart, Link2 } from "lucide-react";

import { useHoldings } from "@/modules/investments/use-holdings";
import { usePrices } from "@/modules/investments/use-prices";
import { buildPortfolio } from "@/modules/investments/portfolio";
import { InvestmentFormDialog } from "@/modules/investments/investment-form";
import { InvestmentTable } from "@/modules/investments/investment-table";
import { formatCurrency, formatPercent } from "@/utils/format";

import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PortfolioAllocationChart = dynamic(
  () =>
    import("@/components/charts/portfolio-allocation-chart").then(
      (m) => m.PortfolioAllocationChart,
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full rounded-xl" />,
  },
);

export function InvestmentsView() {
  const { data: holdings = [], isLoading } = useHoldings();
  const symbols = useMemo(
    () => Array.from(new Set(holdings.map((h) => h.symbol))),
    [holdings],
  );
  const { data: prices = [] } = usePrices(symbols);

  const portfolio = useMemo(
    () => buildPortfolio(holdings, prices),
    [holdings, prices],
  );

  const allocation = useMemo(() => {
    const bySymbol = new Map<string, number>();
    for (const v of portfolio.holdings) {
      bySymbol.set(
        v.holding.symbol,
        (bySymbol.get(v.holding.symbol) ?? 0) + v.currentValue,
      );
    }
    return Array.from(bySymbol.entries())
      .map(([symbol, value]) => ({ symbol, value }))
      .sort((a, b) => b.value - a.value);
  }, [portfolio.holdings]);

  const gainTone =
    portfolio.unrealizedGain > 0
      ? "positive"
      : portfolio.unrealizedGain < 0
        ? "negative"
        : "default";

  return (
    <>
      <PageHeader
        title="Investments"
        description="Your stock portfolio and performance."
        actions={
          <InvestmentFormDialog
            trigger={
              <Button>
                <Plus className="size-4" />
                Add holding
              </Button>
            }
          />
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Current value"
          value={formatCurrency(portfolio.currentValue)}
          icon={Wallet}
        />
        <StatCard
          label="Invested"
          value={formatCurrency(portfolio.invested)}
          icon={TrendingUp}
        />
        <StatCard
          label="Unrealized P&L"
          value={formatCurrency(portfolio.unrealizedGain)}
          hint={formatPercent(portfolio.returnPercent, { signed: true })}
          tone={gainTone}
          icon={LineChart}
        />
        <StatCard
          label="Day's change"
          value={formatCurrency(portfolio.dayChange)}
          tone={
            portfolio.dayChange > 0
              ? "positive"
              : portfolio.dayChange < 0
                ? "negative"
                : "default"
          }
          icon={LineChart}
        />
      </div>

      {/* Broker integration teaser */}
      <Card className="glass mb-6 border-dashed">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
              <Link2 className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Connect your broker</p>
              <p className="text-muted-foreground text-xs">
                Auto-import holdings & live prices from Zerodha Kite or Angel
                One. For now, tap a price to update it manually.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" disabled>
            Coming soon
          </Button>
        </CardContent>
      </Card>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : holdings.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No holdings yet"
          description="Add a stock you own to start tracking your portfolio."
          action={
            <InvestmentFormDialog
              trigger={
                <Button>
                  <Plus className="size-4" />
                  Add holding
                </Button>
              }
            />
          }
        />
      ) : (
        <div className="space-y-6">
          {allocation.length > 0 && portfolio.currentValue > 0 ? (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-base">Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <PortfolioAllocationChart data={allocation} />
              </CardContent>
            </Card>
          ) : null}
          <InvestmentTable rows={portfolio.holdings} />
        </div>
      )}
    </>
  );
}
