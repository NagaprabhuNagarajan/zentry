"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { CategoryBreakdown } from "@/modules/expenses/analytics";
import { formatCurrency } from "@/utils/format";

export function ExpensePieChart({ data }: { data: CategoryBreakdown[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="label"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            stroke="var(--card)"
          >
            {data.map((entry) => (
              <Cell key={entry.category} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            cursor={false}
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "0.625rem",
              color: "var(--popover-foreground)",
              fontSize: "0.8rem",
            }}
            formatter={(value, name) => [
              formatCurrency(Number(value)),
              String(name),
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
