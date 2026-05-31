/**
 * Centralized React Query key factory. Use these everywhere so invalidation
 * stays consistent and typo-free.
 */
export const queryKeys = {
  expenses: {
    all: ["expenses"] as const,
    list: (month: string) => ["expenses", "list", month] as const,
    analytics: (month: string) => ["expenses", "analytics", month] as const,
  },
  income: {
    all: ["income"] as const,
    list: (month: string) => ["income", "list", month] as const,
  },
  savings: {
    trend: (endMonth: string, months: number) =>
      ["savings", "trend", endMonth, months] as const,
  },
  savingsGoals: {
    all: ["savings-goals"] as const,
  },
  holdings: {
    all: ["holdings"] as const,
  },
  prices: {
    all: ["stock-prices"] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    lifetime: ["dashboard", "lifetime"] as const,
  },
  profile: {
    all: ["profile"] as const,
  },
} as const;
