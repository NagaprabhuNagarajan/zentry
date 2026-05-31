import { describe, it, expect } from "vitest";
import {
  calcSavings,
  calcSavingsRate,
  valuateHolding,
  aggregatePortfolio,
} from "@/utils/finance";

describe("calcSavings", () => {
  it("is income minus expenses", () => {
    expect(calcSavings(1000, 400)).toBe(600);
  });
  it("can be negative", () => {
    expect(calcSavings(400, 1000)).toBe(-600);
  });
});

describe("calcSavingsRate", () => {
  it("is savings as a percent of income", () => {
    expect(calcSavingsRate(1000, 400)).toBe(60);
  });
  it("returns 0 when income is 0 (no divide-by-zero)", () => {
    expect(calcSavingsRate(0, 400)).toBe(0);
  });
  it("can be negative when overspending", () => {
    expect(calcSavingsRate(100, 150)).toBe(-50);
  });
});

describe("valuateHolding", () => {
  it("computes invested, value, gain and return %", () => {
    const v = valuateHolding(10, 100, 120);
    expect(v.invested).toBe(1000);
    expect(v.currentValue).toBe(1200);
    expect(v.unrealizedGain).toBe(200);
    expect(v.returnPercent).toBeCloseTo(20);
  });
  it("handles a loss", () => {
    const v = valuateHolding(5, 200, 150);
    expect(v.unrealizedGain).toBe(-250);
    expect(v.returnPercent).toBeCloseTo(-25);
  });
  it("avoids divide-by-zero when buy price is 0", () => {
    const v = valuateHolding(10, 0, 50);
    expect(v.invested).toBe(0);
    expect(v.returnPercent).toBe(0);
  });
});

describe("aggregatePortfolio", () => {
  it("sums valuations and computes blended return %", () => {
    const totals = aggregatePortfolio([
      valuateHolding(10, 100, 120), // invested 1000, gain 200
      valuateHolding(5, 200, 220), // invested 1000, gain 100
    ]);
    expect(totals.invested).toBe(2000);
    expect(totals.currentValue).toBe(2300);
    expect(totals.unrealizedGain).toBe(300);
    expect(totals.returnPercent).toBeCloseTo(15);
  });
  it("is zero for an empty portfolio", () => {
    const totals = aggregatePortfolio([]);
    expect(totals.invested).toBe(0);
    expect(totals.returnPercent).toBe(0);
  });
});
