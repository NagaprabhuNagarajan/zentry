import { describe, it, expect } from "vitest";
import { buildPortfolio } from "@/modules/investments/portfolio";
import type { StockHolding, StockPrice } from "@/types/db";

function holding(
  symbol: string,
  quantity: number,
  buyPrice: number,
): StockHolding {
  return {
    id: `${symbol}-${quantity}`,
    user_id: "u",
    symbol,
    quantity,
    buy_price: buyPrice,
    buy_date: "2026-01-01",
    broker: null,
    source: "manual",
    created_at: "2026-01-01T00:00:00Z",
  };
}

function price(
  symbol: string,
  current: number,
  prevClose: number | null,
): StockPrice {
  return {
    symbol,
    current_price: current,
    previous_close: prevClose,
    currency: "INR",
    updated_at: "2026-05-31T00:00:00Z",
  };
}

describe("buildPortfolio", () => {
  it("values a priced holding with day change", () => {
    const p = buildPortfolio(
      [holding("INFY", 10, 100)],
      [price("INFY", 120, 110)],
    );
    const row = p.holdings[0];
    expect(row.unpriced).toBe(false);
    expect(row.currentValue).toBe(1200);
    expect(row.unrealizedGain).toBe(200);
    expect(row.returnPercent).toBeCloseTo(20);
    expect(row.dayChange).toBe(100); // (120 - 110) * 10
  });

  it("treats an unpriced holding as valued at cost", () => {
    const p = buildPortfolio([holding("TCS", 5, 200)], []);
    const row = p.holdings[0];
    expect(row.unpriced).toBe(true);
    expect(row.currentPrice).toBe(200);
    expect(row.unrealizedGain).toBe(0);
    expect(row.dayChange).toBeNull();
  });

  it("aggregates totals across holdings", () => {
    const p = buildPortfolio(
      [holding("INFY", 10, 100), holding("TCS", 5, 200)],
      [price("INFY", 120, 110)],
    );
    expect(p.invested).toBe(2000); // 1000 + 1000
    expect(p.currentValue).toBe(2200); // 1200 + 1000 (TCS at cost)
    expect(p.unrealizedGain).toBe(200);
    expect(p.dayChange).toBe(100); // only INFY contributes
  });
});
