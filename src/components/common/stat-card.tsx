import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  hint?: string;
  /** Tone for the value text — e.g. profit/loss coloring. */
  tone?: "default" | "positive" | "negative";
  className?: string;
}

const toneClass: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-foreground",
  positive: "text-success",
  negative: "text-destructive",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
  className,
}: StatCardProps) {
  return (
    <Card className={cn("glass", className)}>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-muted-foreground text-sm">{label}</p>
          <p
            className={cn(
              "font-display mt-1.5 truncate text-2xl font-semibold tracking-tight tabular-nums",
              toneClass[tone],
            )}
          >
            {value}
          </p>
          {hint ? (
            <p className="text-muted-foreground mt-1 truncate text-xs">
              {hint}
            </p>
          ) : null}
        </div>
        {Icon ? (
          <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
            <Icon className="size-5" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
