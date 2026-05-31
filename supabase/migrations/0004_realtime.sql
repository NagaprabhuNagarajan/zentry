-- ============================================================================
-- 0004_realtime.sql
-- Stream stock_prices changes to subscribed clients so portfolio values refresh
-- live when the price-sync edge function (or a manual update) writes new prices.
-- ============================================================================

alter publication supabase_realtime add table public.stock_prices;
