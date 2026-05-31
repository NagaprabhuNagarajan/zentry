import type { StockHolding, StockPrice } from "@/types/db";
import {
  aggregatePortfolio,
  valuateHolding,
  type HoldingValuation,
} from "@/utils/finance";

export interface ValuedHolding extends HoldingValuation {
  holding: StockHolding;
  currentPrice: number;
  /** True when no price exists yet for this symbol (valued at buy price). */
  unpriced: boolean;
  /** Day change for the symbol, if a previous close is known. */
  dayChange: number | null;
  dayChangePercent: number | null;
}

export interface PortfolioSummary {
  invested: number;
  currentValue: number;
  unrealizedGain: number;
  returnPercent: number;
  dayChange: number;
  holdings: ValuedHolding[];
}

/** Combine holdings with the latest prices into per-holding + total valuations. */
export function buildPortfolio(
  holdings: StockHolding[],
  prices: StockPrice[],
): PortfolioSummary {
  const priceBySymbol = new Map(prices.map((p) => [p.symbol, p]));

  const valued: ValuedHolding[] = holdings.map((holding) => {
    const price = priceBySymbol.get(holding.symbol);
    const buyPrice = Number(holding.buy_price);
    const quantity = Number(holding.quantity);
    const unpriced = !price;
    const currentPrice = price ? Number(price.current_price) : buyPrice;

    const valuation = valuateHolding(quantity, buyPrice, currentPrice);

    const prevClose = price?.previous_close
      ? Number(price.previous_close)
      : null;
    const dayChange =
      prevClose != null ? (currentPrice - prevClose) * quantity : null;
    const dayChangePercent =
      prevClose != null && prevClose > 0
        ? ((currentPrice - prevClose) / prevClose) * 100
        : null;

    return {
      ...valuation,
      holding,
      currentPrice,
      unpriced,
      dayChange,
      dayChangePercent,
    };
  });

  const totals = aggregatePortfolio(valued);
  const dayChange = valued.reduce((sum, v) => sum + (v.dayChange ?? 0), 0);

  return { ...totals, dayChange, holdings: valued };
}
