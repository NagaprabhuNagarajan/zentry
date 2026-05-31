-- ============================================================================
-- 0001_init.sql — Zentry core schema
-- Identity comes from Supabase Auth (auth.users). We mirror profile fields in
-- `profiles` and scope every user-owned table by user_id = auth.uid().
-- ============================================================================

-- ─── profiles ───────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text,
  email       text,
  avatar_url  text,
  -- App preferences (currency/locale default to INR/en-IN in the UI).
  currency    text not null default 'INR',
  locale      text not null default 'en-IN',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── expenses ─────────────────────────────────────────────────────────────--
create table if not exists public.expenses (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  amount          numeric(14, 2) not null check (amount >= 0),
  category        text not null,
  note            text,
  payment_method  text,
  expense_date    date not null,
  created_at      timestamptz not null default now()
);

-- ─── income ─────────────────────────────────────────────────────────────────
create table if not exists public.income (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  amount       numeric(14, 2) not null check (amount >= 0),
  source       text,
  note         text,
  income_date  date not null,
  created_at   timestamptz not null default now()
);

-- ─── savings_goals ────────────────────────────────────────────────────────--
-- The product spec references goal tracking but defines no table; added here.
create table if not exists public.savings_goals (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  name           text not null,
  target_amount  numeric(14, 2) not null check (target_amount > 0),
  saved_amount   numeric(14, 2) not null default 0 check (saved_amount >= 0),
  target_date    date,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ─── stock_holdings ─────────────────────────────────────────────────────────
create table if not exists public.stock_holdings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  symbol      text not null,
  quantity    numeric(18, 4) not null check (quantity > 0),
  buy_price   numeric(14, 2) not null check (buy_price >= 0),
  buy_date    date not null,
  broker      text,
  -- True when auto-imported from a broker (vs. manually entered).
  source      text not null default 'manual',
  created_at  timestamptz not null default now()
);

-- ─── stock_prices ─────────────────────────────────────────────────────────--
-- Shared price cache. Written only by the service role / edge function.
create table if not exists public.stock_prices (
  symbol         text primary key,
  current_price  numeric(14, 2) not null,
  previous_close numeric(14, 2),
  currency       text not null default 'INR',
  updated_at     timestamptz not null default now()
);

-- ─── portfolio_snapshots ────────────────────────────────────────────────────
-- Daily portfolio valuation, written by the price-sync cron, powers the
-- portfolio growth chart.
create table if not exists public.portfolio_snapshots (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  snapshot_date  date not null,
  invested       numeric(16, 2) not null,
  current_value  numeric(16, 2) not null,
  unrealized_gain numeric(16, 2) not null,
  created_at     timestamptz not null default now(),
  unique (user_id, snapshot_date)
);

-- ─── broker_connections ─────────────────────────────────────────────────────
-- Per-user broker auth state. Tokens are sensitive; store encrypted/server-side
-- and never expose to the client. RLS lets a user see only connection metadata.
create table if not exists public.broker_connections (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  provider       text not null, -- 'zerodha' | 'angelone'
  status         text not null default 'disconnected',
  -- Encrypted token blob; managed by edge functions using a server-side key.
  encrypted_tokens text,
  token_expires_at timestamptz,
  connected_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (user_id, provider)
);

-- ─── indexes ──────────────────────────────────────────────────────────────--
create index if not exists idx_expenses_user_date
  on public.expenses (user_id, expense_date desc);
create index if not exists idx_expenses_user_category
  on public.expenses (user_id, category);
create index if not exists idx_income_user_date
  on public.income (user_id, income_date desc);
create index if not exists idx_holdings_user
  on public.stock_holdings (user_id);
create index if not exists idx_holdings_symbol
  on public.stock_holdings (symbol);
create index if not exists idx_goals_user
  on public.savings_goals (user_id);
create index if not exists idx_snapshots_user_date
  on public.portfolio_snapshots (user_id, snapshot_date desc);

-- ─── updated_at trigger ─────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_goals_updated_at
  before update on public.savings_goals
  for each row execute function public.set_updated_at();
create trigger trg_broker_updated_at
  before update on public.broker_connections
  for each row execute function public.set_updated_at();
