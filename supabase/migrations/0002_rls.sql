-- ============================================================================
-- 0002_rls.sql — Row Level Security
-- Every user-owned table: a user can only touch rows where user_id = auth.uid().
-- `stock_prices` is a shared read-only cache (writes via service role only).
-- ============================================================================

-- ─── profiles ───────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Insert is handled by the signup trigger (security definer); allow self-insert
-- as a fallback too.
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ─── generic owner-scoped tables ────────────────────────────────────────────
-- expenses
alter table public.expenses enable row level security;
create policy "Users manage own expenses"
  on public.expenses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- income
alter table public.income enable row level security;
create policy "Users manage own income"
  on public.income for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- savings_goals
alter table public.savings_goals enable row level security;
create policy "Users manage own goals"
  on public.savings_goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- stock_holdings
alter table public.stock_holdings enable row level security;
create policy "Users manage own holdings"
  on public.stock_holdings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- portfolio_snapshots — users read their own; writes come from the service role
-- (which bypasses RLS), so no insert/update policy is granted to end users.
alter table public.portfolio_snapshots enable row level security;
create policy "Users read own snapshots"
  on public.portfolio_snapshots for select
  using (auth.uid() = user_id);

-- broker_connections — users may read/delete their own connection metadata.
-- Token writes happen via the service role in edge functions.
alter table public.broker_connections enable row level security;
create policy "Users read own broker connections"
  on public.broker_connections for select
  using (auth.uid() = user_id);
create policy "Users delete own broker connections"
  on public.broker_connections for delete
  using (auth.uid() = user_id);

-- ─── stock_prices — shared read-only cache ──────────────────────────────────
alter table public.stock_prices enable row level security;
create policy "Authenticated users can read prices"
  on public.stock_prices for select
  to authenticated
  using (true);
-- No write policies: only the service role (edge function) updates prices.
