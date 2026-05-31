"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { formatCurrency } from "@/utils/format";

export interface AllocationSlice {
  symbol: string;
  value: number;
}

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function PortfolioAllocationChart({
  data,
}: {
  data: AllocationSlice[];
}) {
  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={256}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="symbol"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            stroke="var(--card)"
          >
            {data.map((entry, i) => (
              <Cell key={entry.symbol} fill={PALETTE[i % PALETTE.length]} />
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
