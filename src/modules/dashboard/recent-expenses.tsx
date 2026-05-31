"use client";

import Link from "next/link";

import type { Expense } from "@/types/db";
import { getCategoryMeta } from "@/constants/categories";
import { formatCurrency } from "@/utils/format";
import { formatDate } from "@/utils/date";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function RecentExpenses({ expenses }: { expenses: Expense[] }) {
  const recent = expenses.slice(0, 5);

  return (
    <Card className="glass">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Recent expenses</CardTitle>
        <Button variant="ghost" size="sm" render={<Link href="/expenses" />}>
          View all
        </Button>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            No expenses yet this month.
          </p>
        ) : (
          <ul className="divide-border divide-y">
            {recent.map((e) => {
              const meta = getCategoryMeta(e.category);
              const Icon = meta?.icon;
              return (
                <li key={e.id} className="flex items-center gap-3 py-2.5">
                  <span className="bg-muted text-muted-foreground flex size-8 items-center justify-center rounded-lg">
                    {Icon ? <Icon className="size-4" /> : null}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {e.note?.trim() || meta?.label || e.category}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatDate(e.expense_date)}
                    </p>
                  </div>
                  <span className="text-sm font-medium tabular-nums">
                    {formatCurrency(Number(e.amount))}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
