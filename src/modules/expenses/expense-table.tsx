"use client";

import { Pencil } from "lucide-react";

import type { Expense } from "@/types/db";
import { getCategoryMeta } from "@/constants/categories";
import { formatCurrency } from "@/utils/format";
import { formatDate } from "@/utils/date";
import { ExpenseFormDialog } from "@/modules/expenses/expense-form";
import { DeleteExpenseDialog } from "@/modules/expenses/delete-expense-dialog";

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

export function ExpenseTable({
  month,
  expenses,
}: {
  month: string;
  expenses: Expense[];
}) {
  return (
    <div className="border-border overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead className="hidden sm:table-cell">Note</TableHead>
            <TableHead className="hidden md:table-cell">Payment</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[1%]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => {
            const meta = getCategoryMeta(expense.category);
            const Icon = meta?.icon;
            return (
              <TableRow key={expense.id}>
                <TableCell>
                  <span className="flex items-center gap-2 font-medium">
                    {Icon ? (
                      <Icon className="text-muted-foreground size-4" />
                    ) : null}
                    {meta?.label ?? expense.category}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground hidden max-w-[220px] truncate sm:table-cell">
                  {expense.note || "—"}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {expense.payment_method ? (
                    <Badge variant="secondary">{expense.payment_method}</Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {formatDate(expense.expense_date)}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatCurrency(Number(expense.amount))}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-0.5">
                    <ExpenseFormDialog
                      month={month}
                      expense={expense}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Edit expense"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="size-4" />
                        </Button>
                      }
                    />
                    <DeleteExpenseDialog month={month} id={expense.id} />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
