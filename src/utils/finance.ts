/**
 * Pure finance calculations. Kept side-effect free and unit-testable
 * (these are the functions Milestone 10 will cover with Vitest).
 */

/** Savings = Income − Expenses. */
export function calcSavings(income: number, expenses: number): number {
  return income - expenses;
}

/** Savings rate as a percentage of income. Returns 0 when income is 0. */
export function calcSavingsRate(income: number, expenses: number): number {
  if (income <= 0) return 0;
  return (calcSavings(income, expenses) / income) * 100;
}

export interface HoldingValuation {
  invested: number;
  currentValue: number;
  unrealizedGain: number;
  returnPercent: number;
}

/** Valuation for a single holding given quantity, buy price, and current price. */
export function valuateHolding(
  quantity: number,
  buyPrice: number,
  currentPrice: number,
): HoldingValuation {
  const invested = quantity * buyPrice;
  const currentValue = quantity * currentPrice;
  const unrealizedGain = currentValue - invested;
  const returnPercent = invested > 0 ? (unrealizedGain / invested) * 100 : 0;
  return { invested, currentValue, unrealizedGain, returnPercent };
}

/** Aggregate a list of holding valuations into portfolio totals. */
export function aggregatePortfolio(valuations: HoldingValuation[]) {
  const totals = valuations.reduce(
    (acc, v) => {
      acc.invested += v.invested;
      acc.currentValue += v.currentValue;
      acc.unrealizedGain += v.unrealizedGain;
      return acc;
    },
    { invested: 0, currentValue: 0, unrealizedGain: 0 },
  );
  return {
    ...totals,
    returnPercent:
      totals.invested > 0 ? (totals.unrealizedGain / totals.invested) * 100 : 0,
  };
}
