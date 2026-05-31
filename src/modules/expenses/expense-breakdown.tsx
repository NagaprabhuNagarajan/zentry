"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpensePieChart } from "@/components/charts/expense-pie-chart";
import { formatCurrency } from "@/utils/format";
import { formatPercent } from "@/utils/format";
import type { CategoryBreakdown } from "@/modules/expenses/analytics";

export function ExpenseBreakdown({ data }: { data: CategoryBreakdown[] }) {
  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-base">Category breakdown</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 sm:items-center">
        <ExpensePieChart data={data} />
        <ul className="space-y-2">
          {data.map((c) => (
            <li key={c.category} className="flex items-center gap-2 text-sm">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ background: c.color }}
              />
              <span className="flex-1 truncate">{c.label}</span>
              <span className="font-medium tabular-nums">
                {formatCurrency(c.total)}
              </span>
              <span className="text-muted-foreground w-12 text-right text-xs tabular-nums">
                {formatPercent(c.percent)}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
