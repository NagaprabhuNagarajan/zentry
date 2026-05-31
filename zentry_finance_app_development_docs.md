# Zentry — Personal Finance & Investment Tracker

## Product Vision

Zentry is a modern personal finance dashboard focused on:
- Expense tracking
- Savings analytics
- Stock investment tracking
- Profit/loss analysis
- Monthly financial reports

The application is designed primarily for personal use with a clean and fast experience.

---

# Core Goals

## Primary Goals

- Track monthly expenses
- Track monthly savings
- Monitor stock investments daily
- Generate financial reports
- Visualize profit/loss and growth
- Maintain a simple and modern UX

---

# Tech Stack

## Frontend

### Framework
- Next.js 15+
- React 19+
- TypeScript

### UI
- Tailwind CSS
- Shadcn UI
- Lucide Icons
- Framer Motion

### State Management
- Zustand

### API/Data Layer
- React Query (TanStack Query)
- Axios

### Charts
- Recharts

---

## Backend

### Backend Platform
- Supabase

### Services Used
- PostgreSQL Database
- Supabase Auth
- Row Level Security (RLS)
- Edge Functions
- Realtime
- Storage
- Cron Jobs

---

# Project Architecture

## Frontend Architecture

### Recommended Structure

```txt
src/
 ├── app/
 │    ├── dashboard/
 │    ├── expenses/
 │    ├── savings/
 │    ├── investments/
 │    ├── reports/
 │    └── settings/
 │
 ├── components/
 │    ├── common/
 │    ├── charts/
 │    ├── forms/
 │    ├── layouts/
 │    └── ui/
 │
 ├── modules/
 │    ├── dashboard/
 │    ├── expenses/
 │    ├── savings/
 │    ├── investments/
 │    └── reports/
 │
 ├── hooks/
 ├── services/
 ├── store/
 ├── lib/
 ├── utils/
 ├── types/
 ├── constants/
 └── styles/
```

---

# Feature Specifications

# 1. Dashboard Module

## Features

### Overview Cards
- Total Balance
- Monthly Expenses
- Monthly Savings
- Stock Portfolio Value
- Profit/Loss
- Savings Rate

### Charts
- Expense breakdown
- Monthly trends
- Savings growth
- Portfolio growth

### Dashboard Widgets
- Top spending category
- Recent expenses
- Investment summary
- Current month analytics

---

# 2. Expense Management

## Features

### Add Expense
Fields:
- Amount
- Category
- Note
- Date
- Payment method

### Categories
Default categories:
- Food
- Fuel
- Rent
- Shopping
- Bills
- Travel
- Family
- Medical
- Entertainment
- Misc

### Functionalities
- Create expense
- Edit expense
- Delete expense
- Filter by month
- Filter by category
- Search expenses
- Monthly analytics

---

# 3. Savings Module

## Features

### Income Tracking
Fields:
- Amount
- Source
- Date
- Note

### Savings Analytics
- Monthly savings
- Savings ratio
- Savings trends
- Goal tracking

### Formula

```txt
Savings = Income - Expenses
```

---

# 4. Investment Module

## Features

### Add Stock Holding
Fields:
- Stock symbol
- Quantity
- Buy price
- Buy date
- Broker

### Daily Updates
- Current stock price
- Daily profit/loss
- Portfolio value
- ROI percentage

### Metrics
- Total invested amount
- Current portfolio value
- Unrealized gains
- Profit percentage

---

# 5. Reports Module

## Features

### Monthly Reports
- Expense summary
- Savings summary
- Investment performance
- Profit/loss summary

### Export Options
- PDF
- CSV
- Excel

### Visual Reports
- Pie charts
- Bar charts
- Line charts
- Growth analytics

---

# Database Design

# Tables

## users

```sql
create table users (
  id uuid primary key,
  name text,
  email text unique,
  created_at timestamptz default now()
);
```

---

## expenses

```sql
create table expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  amount numeric not null,
  category text not null,
  note text,
  payment_method text,
  expense_date date not null,
  created_at timestamptz default now()
);
```

---

## income

```sql
create table income (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  amount numeric not null,
  source text,
  note text,
  income_date date not null,
  created_at timestamptz default now()
);
```

---

## stock_holdings

```sql
create table stock_holdings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  symbol text not null,
  quantity numeric not null,
  buy_price numeric not null,
  buy_date date not null,
  broker text,
  created_at timestamptz default now()
);
```

---

## stock_prices

```sql
create table stock_prices (
  id uuid primary key default gen_random_uuid(),
  symbol text unique not null,
  current_price numeric not null,
  updated_at timestamptz default now()
);
```

---

# Supabase Setup Guide

## Create Project

1. Create Supabase project
2. Copy:
   - Project URL
   - Anon key
   - Service role key

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STOCK_API_KEY=
```

---

# Authentication

## Recommended

Use Supabase Email Authentication.

### Auth Features
- Login
- Signup
- Password reset
- Session persistence

---

# Row Level Security

## Example RLS

```sql
alter table expenses enable row level security;

create policy "Users can manage own expenses"
on expenses
for all
using (auth.uid() = user_id);
```

Apply similar rules for:
- income
- stock_holdings
- savings

---

# Stock Price Integration

## Recommended APIs

### Option 1
Alpha Vantage

### Option 2
Finnhub

### Option 3
Twelve Data

---

# Daily Stock Update Flow

```txt
Supabase Cron
      ↓
Edge Function
      ↓
Fetch stock prices
      ↓
Update stock_prices table
      ↓
Realtime UI refresh
```

---

# Supabase Edge Function

## Responsibilities

- Fetch latest stock prices
- Update portfolio values
- Calculate gains/losses
- Trigger notifications later

---

# UI Design Guidelines

## Theme

### Style
- Modern fintech UI
- Minimalistic
- Glassmorphism/light blur
- Rounded corners
- Dark mode support

### Colors

Primary:
- Cyan
- Purple
- Dark navy

### Typography
- Inter
- Geist

---

# Pages

## Main Pages

### Dashboard
```txt
/dashboard
```

### Expenses
```txt
/expenses
```

### Savings
```txt
/savings
```

### Investments
```txt
/investments
```

### Reports
```txt
/reports
```

### Settings
```txt
/settings
```

---

# Component Planning

## Reusable Components

### Cards
- StatCard
- ProfitCard
- SummaryCard

### Tables
- ExpenseTable
- InvestmentTable

### Charts
- ExpensePieChart
- SavingsBarChart
- PortfolioLineChart

### Forms
- ExpenseForm
- IncomeForm
- InvestmentForm

---

# API Layer Structure

```txt
services/
 ├── expenses.service.ts
 ├── income.service.ts
 ├── investments.service.ts
 ├── dashboard.service.ts
 └── reports.service.ts
```

---

# Zustand Store Structure

```txt
store/
 ├── auth.store.ts
 ├── expense.store.ts
 ├── savings.store.ts
 ├── investment.store.ts
 └── dashboard.store.ts
```

---

# Development Phases

# Phase 1 — MVP

## Features

- Authentication
- Expense management
- Income management
- Savings calculations
- Investment tracking
- Dashboard
- Reports

Goal:
Fully usable personal finance tracker.

---

# Phase 2 — Smart Features

## Features

- Budget alerts
- AI insights
- Advanced analytics
- Recurring expenses
- CSV import/export
- Monthly summary notifications

---

# Phase 3 — Advanced

## Features

- UPI import
- SMS parsing
- Mutual funds
- Family accounts
- Mobile app
- AI financial assistant

---

# Performance Guidelines

## Frontend

- Use React Server Components where possible
- Lazy load charts
- Memoize expensive calculations
- Use optimistic updates

## Backend

- Add indexes on:
  - user_id
  - dates
  - stock symbol

---

# Security Guidelines

## Important

- Never expose service role key
- Use RLS everywhere
- Validate inputs
- Sanitize notes/comments
- Restrict Edge Functions

---

# Deployment

## Frontend

Recommended:
- Vercel

## Backend
- Supabase hosted backend

---

# Recommended Packages

## Core Packages

```bash
npm install @supabase/supabase-js
npm install @tanstack/react-query
npm install zustand
npm install axios
npm install recharts
npm install react-hook-form
npm install zod
npm install framer-motion
npm install lucide-react
```

---

# Claude Code Development Instructions

## Rules For Claude Code

### Architecture Rules

- Use TypeScript strictly
- Create reusable components
- Avoid duplicate code
- Use server actions when possible
- Follow modular architecture
- Separate UI and business logic

---

## Code Style Rules

### Components
- Small reusable components
- Proper typing
- Avoid prop drilling
- Use hooks for reusable logic

### API Layer
- Centralized API calls
- Proper error handling
- Typed responses

### Database
- Typed schemas
- Migration-based updates
- Use Supabase policies

---

# UI/UX Requirements For Claude Code

## Requirements

- Responsive design
- Mobile-first layout
- Smooth animations
- Clean dashboard experience
- Modern card-based layout
- Fast loading

---

# Future Mobile App

## Recommended

### Option 1
Flutter

### Option 2
React Native

Reuse:
- Supabase backend
- Shared business logic
- APIs

---

# Final Product Goal

Zentry should feel like:
- A modern fintech dashboard
- A lightweight personal finance OS
- A fast and beautiful analytics platform
- A premium personal investment tracker

The focus should always remain:
- Simplicity
- Performance
- Clean UI
- Useful analytics
- Smooth UX

