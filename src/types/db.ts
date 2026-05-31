/**
 * Convenience row/insert/update aliases over the generated Supabase types.
 * Kept separate from `database.types.ts` so `supabase gen types` (which
 * overwrites that file) never clobbers these.
 */
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/types/database.types";

export type Profile = Tables<"profiles">;
export type ProfileUpdate = TablesUpdate<"profiles">;

export type Expense = Tables<"expenses">;
export type ExpenseInsert = TablesInsert<"expenses">;
export type ExpenseUpdate = TablesUpdate<"expenses">;

export type Income = Tables<"income">;
export type IncomeInsert = TablesInsert<"income">;
export type IncomeUpdate = TablesUpdate<"income">;

export type SavingsGoal = Tables<"savings_goals">;
export type SavingsGoalInsert = TablesInsert<"savings_goals">;
export type SavingsGoalUpdate = TablesUpdate<"savings_goals">;

export type StockHolding = Tables<"stock_holdings">;
export type StockHoldingInsert = TablesInsert<"stock_holdings">;
export type StockHoldingUpdate = TablesUpdate<"stock_holdings">;

export type StockPrice = Tables<"stock_prices">;
export type PortfolioSnapshot = Tables<"portfolio_snapshots">;
export type BrokerConnection = Tables<"broker_connections">;
