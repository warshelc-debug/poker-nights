# PokerNights — Session Memory

## What has been built (Session 2 — 2026-06-28)
- Start Game tab completely rebuilt (3-step flow: setup → live → summary)
- New pre-game setup: Location dropdown (Jake's House / AJ's House / Casino / Online), Buy-in, Small Blind / Big Blind inputs
- Live session: HH:MM:SS timer, Add On modal, Update Stack modal with timestamped history, real-time P/L display
- Stack history list (scrollable, shows time + stack + P/L per update)
- Cashout input + End Session saves location, blinds, cashout, buyin, profit_loss to Supabase
- Post-session summary card with "View Leaderboard" button that switches tabs
- sessions table needs 3 new columns: `location`, `small_blind`, `big_blind`, `cashout` — see SQL below
- .env Supabase URL fixed (removed erroneous /rest/v1/ suffix)
- Build verified clean

## What has been built (Session 1 — 2026-06-27)
- Full React app scaffolded via Create React App
- `@supabase/supabase-js` installed
- All app code written in `src/App.js` (single-file architecture)
- `src/index.css` trimmed to minimal global resets
- `.env.example` created with placeholder keys
- `.gitignore` created (excludes `.env`, `node_modules`, `build`)
- `CLAUDE.md` documenting project conventions
- Build verified clean: `npm run build` passes with no errors

## App screens implemented
- **Auth screen** — email/password login + signup
- **Username setup** — first-login username + avatar color picker
- **Leaderboard tab** — monthly/quarterly/all-time ranking with player drill-down
- **My Stats tab** — P/L, sessions, hours, VPIP%; session list → hand history drill-down
- **Start Game tab** — buy-in input → live session timer → log hand modal → end session
- **Profile tab** — avatar, stats summary, sign out
- **Log Hand modal** — hole cards, position picker, preflop/flop/turn/river actions, result, pot size

## Supabase tables needed
See SQL section below. Tables not yet created — user must run SQL in Supabase dashboard.

## Known issues / next steps
- Run the ALTER TABLE SQL below to add new sessions columns
- Push to GitHub + Vercel to deploy updated Start Game tab
- Email confirmation may be required depending on Supabase project settings (can disable in Auth > Settings)

---

## Supabase schema migrations

### Session 2 — ALTER TABLE (run this in Supabase SQL Editor)
```sql
alter table sessions add column if not exists location text;
alter table sessions add column if not exists small_blind numeric default 0.5;
alter table sessions add column if not exists big_blind numeric default 1.0;
alter table sessions add column if not exists cashout numeric;
```

---

## Supabase table schemas (original — Session 1)

```sql
-- profiles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  avatar_color text default '#e53e3e',
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users can read all profiles" on profiles for select using (true);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- sessions
create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  buyin numeric not null default 0,
  start_time timestamptz,
  end_time timestamptz,
  profit_loss numeric default 0,
  created_at timestamptz default now()
);
alter table sessions enable row level security;
create policy "Users can read all sessions" on sessions for select using (true);
create policy "Users can insert own sessions" on sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own sessions" on sessions for update using (auth.uid() = user_id);

-- hands
create table hands (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  hole_cards text,
  position text,
  preflop_action text,
  flop_action text,
  turn_action text,
  river_action text,
  result text,
  pot_size numeric default 0,
  created_at timestamptz default now()
);
alter table hands enable row level security;
create policy "Users can read all hands" on hands for select using (true);
create policy "Users can insert own hands" on hands for insert with check (auth.uid() = user_id);
```
