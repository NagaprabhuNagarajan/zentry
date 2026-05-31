/**
 * App-wide formatting helpers. Locale + currency are fixed to INR / en-IN
 * (lakh–crore grouping, ₹ symbol). Centralized so a future Settings toggle
 * can override these in one place.
 */

export const LOCALE = "en-IN";
export const CURRENCY = "INR";

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
  maximumFractionDigits: 0,
});

const currencyFormatterPaise = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat(LOCALE);

/** ₹1,23,456 — rounded to whole rupees (default for cards/tables). */
export function formatCurrency(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return currencyFormatter.format(value);
}

/** ₹1,23,456.78 — with paise, for precise figures. */
export function formatCurrencyPrecise(
  value: number | null | undefined,
): string {
  if (value == null || Number.isNaN(value)) return "—";
  return currencyFormatterPaise.format(value);
}

/** Signed currency with +/- prefix — for profit/loss. */
export function formatSignedCurrency(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${formatCurrency(Math.abs(value))}`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return numberFormatter.format(value);
}

/** 12.3% — defaults to 1 decimal, with optional +/- sign. */
export function formatPercent(
  value: number | null | undefined,
  {
    signed = false,
    fractionDigits = 1,
  }: { signed?: boolean; fractionDigits?: number } = {},
): string {
  if (value == null || Number.isNaN(value)) return "—";
  const sign = signed && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(fractionDigits)}%`;
}

/** Compact form for large figures: ₹1.2L, ₹3.4Cr. */
export function formatCompactCurrency(
  value: number | null | undefined,
): string {
  if (value == null || Number.isNaN(value)) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2)}Cr`;
  if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(2)}L`;
  if (abs >= 1e3) return `${sign}₹${(abs / 1e3).toFixed(1)}K`;
  return formatCurrency(value);
}
