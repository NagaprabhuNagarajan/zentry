import { describe, it, expect } from "vitest";
import { computeExpenseAnalytics } from "@/modules/expenses/analytics";
import type { Expense } from "@/types/db";

function expense(amount: number, category: string): Expense {
  return {
    id: crypto.randomUUID(),
    user_id: "u",
    amount,
    category,
    note: null,
    payment_method: null,
    expense_date: "2026-05-01",
    created_at: "2026-05-01T00:00:00Z",
  };
}

describe("computeExpenseAnalytics", () => {
  it("returns zeros for no expenses", () => {
    const a = computeExpenseAnalytics([]);
    expect(a.total).toBe(0);
    expect(a.count).toBe(0);
    expect(a.byCategory).toEqual([]);
    expect(a.topCategory).toBeNull();
  });

  it("totals amounts and groups by category, sorted desc", () => {
    const a = computeExpenseAnalytics([
      expense(100, "Food"),
      expense(50, "Food"),
      expense(200, "Fuel"),
    ]);
    expect(a.total).toBe(350);
    expect(a.count).toBe(3);
    expect(a.byCategory.map((c) => c.category)).toEqual(["Fuel", "Food"]);
    expect(a.topCategory?.category).toBe("Fuel");
  });

  it("computes category percentages of the total", () => {
    const a = computeExpenseAnalytics([
      expense(750, "Rent"),
      expense(250, "Food"),
    ]);
    const rent = a.byCategory.find((c) => c.category === "Rent");
    expect(rent?.percent).toBeCloseTo(75);
  });
});
