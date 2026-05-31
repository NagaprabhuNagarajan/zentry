"use client";

import { Pencil, RefreshCw } from "lucide-react";

import type { ValuedHolding } from "@/modules/investments/portfolio";
import { InvestmentFormDialog } from "@/modules/investments/investment-form";
import { DeleteHoldingDialog } from "@/modules/investments/delete-holding-dialog";
import { UpdatePriceDialog } from "@/modules/investments/update-price-dialog";
import { formatCurrency, formatNumber, formatPercent } from "@/utils/format";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function gainTone(value: number) {
  return value > 0 ? "text-success" : value < 0 ? "text-destructive" : "";
}

export function InvestmentTable({ rows }: { rows: ValuedHolding[] }) {
  return (
    <div className="border-border overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="hidden text-right sm:table-cell">
              Avg cost
            </TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="hidden text-right md:table-cell">
              Value
            </TableHead>
            <TableHead className="text-right">P&amp;L</TableHead>
            <TableHead className="w-[1%]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ holding, currentPrice, ...v }) => (
            <TableRow key={holding.id}>
              <TableCell>
                <div className="flex items-center gap-2 font-medium">
                  {holding.symbol}
                  {v.unpriced ? (
                    <Badge variant="secondary" className="text-xs font-normal">
                      no price
                    </Badge>
                  ) : null}
                </div>
                {holding.broker ? (
                  <span className="text-muted-foreground text-xs">
                    {holding.broker}
                  </span>
                ) : null}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(Number(holding.quantity))}
              </TableCell>
              <TableCell className="hidden text-right tabular-nums sm:table-cell">
                {formatCurrency(Number(holding.buy_price))}
              </TableCell>
              <TableCell className="text-right">
                <UpdatePriceDialog
                  symbol={holding.symbol}
                  currentPrice={currentPrice}
                  trigger={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 tabular-nums"
                    >
                      {formatCurrency(currentPrice)}
                      <RefreshCw className="text-muted-foreground size-3" />
                    </Button>
                  }
                />
              </TableCell>
              <TableCell className="hidden text-right tabular-nums md:table-cell">
                {formatCurrency(v.currentValue)}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right tabular-nums",
                  gainTone(v.unrealizedGain),
                )}
              >
                <div>{formatCurrency(v.unrealizedGain)}</div>
                <div className="text-xs">
                  {formatPercent(v.returnPercent, { signed: true })}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-0.5">
                  <InvestmentFormDialog
                    holding={holding}
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Edit holding"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="size-4" />
                      </Button>
                    }
                  />
                  <DeleteHoldingDialog id={holding.id} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
