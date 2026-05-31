"use client";

import Link from "next/link";

import type { PortfolioSummary } from "@/modules/investments/portfolio";
import { formatCurrency, formatPercent } from "@/utils/format";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function InvestmentSummary({
  portfolio,
}: {
  portfolio: PortfolioSummary;
}) {
  // Top holdings by current value.
  const top = [...portfolio.holdings]
    .sort((a, b) => b.currentValue - a.currentValue)
    .slice(0, 5);

  return (
    <Card className="glass">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Top holdings</CardTitle>
        <Button variant="ghost" size="sm" render={<Link href="/investments" />}>
          View all
        </Button>
      </CardHeader>
      <CardContent>
        {top.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            No holdings yet.
          </p>
        ) : (
          <ul className="divide-border divide-y">
            {top.map((v) => (
              <li key={v.holding.id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {v.holding.symbol}
                  </p>
                  <p className="text-muted-foreground text-xs tabular-nums">
                    {formatCurrency(v.currentValue)}
                  </p>
                </div>
                <span
                  className={cn(
                    "text-sm font-medium tabular-nums",
                    v.unrealizedGain > 0
                      ? "text-success"
                      : v.unrealizedGain < 0
                        ? "text-destructive"
                        : "",
                  )}
                >
                  {formatPercent(v.returnPercent, { signed: true })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
