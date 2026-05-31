"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMonthLabel } from "@/utils/date";

interface MonthNavigatorProps {
  month: string;
  onPrev: () => void;
  onNext: () => void;
  disableNext?: boolean;
}

export function MonthNavigator({
  month,
  onPrev,
  onNext,
  disableNext,
}: MonthNavigatorProps) {
  return (
    <div className="border-border bg-card flex items-center gap-1 rounded-lg border p-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onPrev}
        aria-label="Previous month"
      >
        <ChevronLeft className="size-4" />
      </Button>
      <span className="min-w-[8.5rem] text-center text-sm font-medium">
        {formatMonthLabel(month)}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onNext}
        disabled={disableNext}
        aria-label="Next month"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
