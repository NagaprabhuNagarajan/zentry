"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  expenseSchema,
  type ExpenseFormValues,
} from "@/lib/validations/expense";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/constants/categories";
import {
  useCreateExpense,
  useUpdateExpense,
} from "@/modules/expenses/use-expenses";
import { todayIso } from "@/utils/date";
import type { Expense } from "@/types/db";

import { Field } from "@/components/forms/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ExpenseFormDialogProps {
  month: string;
  expense?: Expense;
  trigger: React.ReactNode;
}

export function ExpenseFormDialog({
  month,
  expense,
  trigger,
}: ExpenseFormDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(expense);

  const create = useCreateExpense(month);
  const update = useUpdateExpense(month);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense
      ? {
          amount: Number(expense.amount),
          category: expense.category,
          payment_method:
            (expense.payment_method as ExpenseFormValues["payment_method"]) ??
            undefined,
          note: expense.note ?? "",
          expense_date: expense.expense_date,
        }
      : {
          category: "Food",
          expense_date: todayIso(),
          note: "",
        },
  });

  async function onSubmit(values: ExpenseFormValues) {
    try {
      if (expense) {
        await update.mutateAsync({
          id: expense.id,
          patch: {
            amount: values.amount,
            category: values.category,
            payment_method: values.payment_method ?? null,
            note: values.note?.trim() ? values.note.trim() : null,
            expense_date: values.expense_date,
          },
        });
        toast.success("Expense updated");
      } else {
        await create.mutateAsync(values);
        toast.success("Expense added");
      }
      setOpen(false);
      if (!isEdit) reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit expense" : "Add expense"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details of this expense."
              : "Record a new expense."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field
            label="Amount (₹)"
            htmlFor="amount"
            error={errors.amount?.message}
          >
            <Input
              id="amount"
              type="number"
              step="0.01"
              inputMode="decimal"
              placeholder="0"
              {...register("amount", { valueAsNumber: true })}
            />
          </Field>

          <Field label="Category" error={errors.category?.message}>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        <c.icon className="text-muted-foreground size-4" />
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Date"
              htmlFor="expense_date"
              error={errors.expense_date?.message}
            >
              <Input
                id="expense_date"
                type="date"
                {...register("expense_date")}
              />
            </Field>
            <Field label="Payment" error={errors.payment_method?.message}>
              <Controller
                control={control}
                name="payment_method"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>

          <Field label="Note" htmlFor="note" error={errors.note?.message}>
            <Textarea
              id="note"
              rows={2}
              placeholder="Optional note"
              {...register("note")}
            />
          </Field>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              {isEdit ? "Save changes" : "Add expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
