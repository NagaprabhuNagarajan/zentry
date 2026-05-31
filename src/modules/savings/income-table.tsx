"use client";

import { Pencil } from "lucide-react";

import type { Income } from "@/types/db";
import { formatCurrency } from "@/utils/format";
import { formatDate } from "@/utils/date";
import { IncomeFormDialog } from "@/modules/savings/income-form";
import { DeleteIncomeDialog } from "@/modules/savings/delete-income-dialog";

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

export function IncomeTable({
  month,
  income,
}: {
  month: string;
  income: Income[];
}) {
  return (
    <div className="border-border overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Source</TableHead>
            <TableHead className="hidden sm:table-cell">Note</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[1%]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {income.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>
                <Badge variant="secondary">{entry.source ?? "Other"}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground hidden max-w-[260px] truncate sm:table-cell">
                {entry.note || "—"}
              </TableCell>
              <TableCell className="text-muted-foreground whitespace-nowrap">
                {formatDate(entry.income_date)}
              </TableCell>
              <TableCell className="text-success text-right font-medium tabular-nums">
                {formatCurrency(Number(entry.amount))}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-0.5">
                  <IncomeFormDialog
                    income={entry}
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Edit income"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="size-4" />
                      </Button>
                    }
                  />
                  <DeleteIncomeDialog month={month} id={entry.id} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
