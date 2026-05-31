"use client";

import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

import type { SavingsGoal } from "@/types/db";
import { useDeleteGoal } from "@/modules/savings/use-savings-goals";
import { GoalFormDialog } from "@/modules/savings/goal-form";
import { formatCurrency } from "@/utils/format";
import { formatDate } from "@/utils/date";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function GoalCard({ goal }: { goal: SavingsGoal }) {
  const remove = useDeleteGoal();
  const target = Number(goal.target_amount);
  const saved = Number(goal.saved_amount);
  const percent = target > 0 ? Math.min((saved / target) * 100, 100) : 0;
  const reached = saved >= target;

  async function onDelete() {
    try {
      await remove.mutateAsync(goal.id);
      toast.success("Goal deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete");
    }
  }

  return (
    <Card className="glass">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium">{goal.name}</p>
            {goal.target_date ? (
              <p className="text-muted-foreground text-xs">
                by {formatDate(goal.target_date)}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <GoalFormDialog
              goal={goal}
              trigger={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Edit goal"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="size-4" />
                </Button>
              }
            />
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Delete goal"
              className="text-muted-foreground hover:text-destructive"
              onClick={onDelete}
              disabled={remove.isPending}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
            <div
              className={reached ? "bg-success h-full" : "bg-primary h-full"}
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="font-medium tabular-nums">
              {formatCurrency(saved)}
            </span>
            <span className="text-muted-foreground tabular-nums">
              {formatCurrency(target)}
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            {reached ? "Goal reached 🎉" : `${percent.toFixed(0)}% saved`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
