"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  savingsGoalSchema,
  type SavingsGoalFormValues,
} from "@/lib/validations/savings-goal";
import {
  useCreateGoal,
  useUpdateGoal,
} from "@/modules/savings/use-savings-goals";
import type { SavingsGoal } from "@/types/db";

import { Field } from "@/components/forms/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface GoalFormDialogProps {
  goal?: SavingsGoal;
  trigger: React.ReactNode;
}

export function GoalFormDialog({ goal, trigger }: GoalFormDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(goal);

  const create = useCreateGoal();
  const update = useUpdateGoal();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SavingsGoalFormValues>({
    resolver: zodResolver(savingsGoalSchema),
    defaultValues: goal
      ? {
          name: goal.name,
          target_amount: Number(goal.target_amount),
          saved_amount: Number(goal.saved_amount),
          target_date: goal.target_date ?? "",
        }
      : { saved_amount: 0 },
  });

  async function onSubmit(values: SavingsGoalFormValues) {
    try {
      if (goal) {
        await update.mutateAsync({
          id: goal.id,
          patch: {
            name: values.name.trim(),
            target_amount: values.target_amount,
            saved_amount: values.saved_amount,
            target_date: values.target_date || null,
          },
        });
        toast.success("Goal updated");
      } else {
        await create.mutateAsync(values);
        toast.success("Goal created");
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
          <DialogTitle>{isEdit ? "Edit goal" : "New savings goal"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update your goal target and progress."
              : "Set a target to save towards."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Name" htmlFor="name" error={errors.name?.message}>
            <Input
              id="name"
              placeholder="e.g. Emergency fund"
              {...register("name")}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Target (₹)"
              htmlFor="target_amount"
              error={errors.target_amount?.message}
            >
              <Input
                id="target_amount"
                type="number"
                step="0.01"
                inputMode="decimal"
                {...register("target_amount", { valueAsNumber: true })}
              />
            </Field>
            <Field
              label="Saved (₹)"
              htmlFor="saved_amount"
              error={errors.saved_amount?.message}
            >
              <Input
                id="saved_amount"
                type="number"
                step="0.01"
                inputMode="decimal"
                {...register("saved_amount", { valueAsNumber: true })}
              />
            </Field>
          </div>
          <Field
            label="Target date (optional)"
            htmlFor="target_date"
            error={errors.target_date?.message}
          >
            <Input id="target_date" type="date" {...register("target_date")} />
          </Field>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              {isEdit ? "Save changes" : "Create goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
