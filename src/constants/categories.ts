import {
  Utensils,
  Fuel,
  Home,
  ShoppingBag,
  Receipt,
  Plane,
  Users,
  HeartPulse,
  Clapperboard,
  Wallet,
  Briefcase,
  TrendingUp,
  Gift,
  Landmark,
  type LucideIcon,
} from "lucide-react";

export type ExpenseCategory =
  | "Food"
  | "Fuel"
  | "Rent"
  | "Shopping"
  | "Bills"
  | "Travel"
  | "Family"
  | "Medical"
  | "Entertainment"
  | "Misc";

export interface CategoryMeta {
  value: ExpenseCategory;
  label: string;
  icon: LucideIcon;
  /** Tailwind text color token used for chips/charts. */
  color: string;
}

export const EXPENSE_CATEGORIES: CategoryMeta[] = [
  { value: "Food", label: "Food", icon: Utensils, color: "var(--chart-1)" },
  { value: "Fuel", label: "Fuel", icon: Fuel, color: "var(--chart-4)" },
  { value: "Rent", label: "Rent", icon: Home, color: "var(--chart-2)" },
  {
    value: "Shopping",
    label: "Shopping",
    icon: ShoppingBag,
    color: "var(--chart-5)",
  },
  { value: "Bills", label: "Bills", icon: Receipt, color: "var(--chart-3)" },
  { value: "Travel", label: "Travel", icon: Plane, color: "var(--chart-1)" },
  { value: "Family", label: "Family", icon: Users, color: "var(--chart-2)" },
  {
    value: "Medical",
    label: "Medical",
    icon: HeartPulse,
    color: "var(--chart-5)",
  },
  {
    value: "Entertainment",
    label: "Entertainment",
    icon: Clapperboard,
    color: "var(--chart-4)",
  },
  { value: "Misc", label: "Misc", icon: Wallet, color: "var(--chart-3)" },
];

export const EXPENSE_CATEGORY_VALUES = EXPENSE_CATEGORIES.map((c) => c.value);

export function getCategoryMeta(value: string): CategoryMeta | undefined {
  return EXPENSE_CATEGORIES.find((c) => c.value === value);
}

export const PAYMENT_METHODS = [
  "UPI",
  "Cash",
  "Credit Card",
  "Debit Card",
  "Net Banking",
  "Wallet",
  "Other",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface IncomeSourceMeta {
  value: string;
  label: string;
  icon: LucideIcon;
}

export const INCOME_SOURCES: IncomeSourceMeta[] = [
  { value: "Salary", label: "Salary", icon: Briefcase },
  { value: "Business", label: "Business", icon: Landmark },
  { value: "Investments", label: "Investments", icon: TrendingUp },
  { value: "Freelance", label: "Freelance", icon: Wallet },
  { value: "Gift", label: "Gift", icon: Gift },
  { value: "Other", label: "Other", icon: Wallet },
];

export const INCOME_SOURCE_VALUES = INCOME_SOURCES.map((s) => s.value);

export const BROKERS = ["Zerodha (Kite)", "Angel One", "Other"] as const;
export type Broker = (typeof BROKERS)[number];
