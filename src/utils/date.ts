import {
  format,
  startOfMonth,
  endOfMonth,
  parseISO,
  isValid,
  subMonths,
} from "date-fns";

/** A month key in `YYYY-MM` form, used for filtering and grouping. */
export type MonthKey = string;

/** The last `count` month keys ending at (and including) `endMonth`, oldest first. */
export function lastMonthKeys(count: number, endMonth: MonthKey): MonthKey[] {
  const end = parseISO(`${endMonth}-01`);
  return Array.from({ length: count }, (_, i) =>
    toMonthKey(subMonths(end, count - 1 - i)),
  );
}

export function toMonthKey(date: Date): MonthKey {
  return format(date, "yyyy-MM");
}

export function currentMonthKey(): MonthKey {
  // Note: callers pass `new Date()` from a client/server boundary as needed.
  return toMonthKey(new Date());
}

/** Inclusive ISO date range (`YYYY-MM-DD`) covering a month key. */
export function monthRange(monthKey: MonthKey): { start: string; end: string } {
  const base = parseISO(`${monthKey}-01`);
  return {
    start: format(startOfMonth(base), "yyyy-MM-dd"),
    end: format(endOfMonth(base), "yyyy-MM-dd"),
  };
}

/** "May 2026" — human label for a month key. */
export function formatMonthLabel(monthKey: MonthKey): string {
  const base = parseISO(`${monthKey}-01`);
  return isValid(base) ? format(base, "MMMM yyyy") : monthKey;
}

/** "31 May 2026" — human label for an ISO date string. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = parseISO(iso);
  return isValid(d) ? format(d, "dd MMM yyyy") : iso;
}

export function todayIso(): string {
  return format(new Date(), "yyyy-MM-dd");
}
