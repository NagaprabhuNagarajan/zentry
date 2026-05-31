"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { incomeSchema, type IncomeFormValues } from "@/lib/validations/income";
import { INCOME_SOURCES } from "@/constants/categories";
import { useCreateIncome, useUpdateIncome } from "@/modules/savings/use-income";
import { todayIso } from "@/utils/date";
import type { Income } from "@/types/db";

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

interface IncomeFormDialogProps {
  income?: Income;
  trigger: React.ReactNode;
}

export function IncomeFormDialog({ income, trigger }: IncomeFormDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(income);

  const create = useCreateIncome();
  const update = useUpdateIncome();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: income
      ? {
          amount: Number(income.amount),
          source: income.source ?? "Salary",
          note: income.note ?? "",
          income_date: income.income_date,
        }
      : { source: "Salary", income_date: todayIso(), note: "" },
  });

  async function onSubmit(values: IncomeFormValues) {
    try {
      if (income) {
        await update.mutateAsync({
          id: income.id,
          patch: {
            amount: values.amount,
            source: values.source,
            note: values.note?.trim() ? values.note.trim() : null,
            income_date: values.income_date,
          },
        });
        toast.success("Income updated");
      } else {
        await create.mutateAsync(values);
        toast.success("Income added");
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
          <DialogTitle>{isEdit ? "Edit income" : "Add income"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details of this income."
              : "Record income received."}
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

          <div className="grid grid-cols-2 gap-3">
            <Field label="Source" error={errors.source?.message}>
              <Controller
                control={control}
                name="source"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Source" />
                    </SelectTrigger>
                    <SelectContent>
                      {INCOME_SOURCES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          <s.icon className="text-muted-foreground size-4" />
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field
              label="Date"
              htmlFor="income_date"
              error={errors.income_date?.message}
            >
              <Input
                id="income_date"
                type="date"
                {...register("income_date")}
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
              {isEdit ? "Save changes" : "Add income"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
