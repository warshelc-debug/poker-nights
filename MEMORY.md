# PokerNights — Session Memory

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
- User must create a Supabase project, copy URL + anon key into `.env`
- Must run the SQL schema in Supabase dashboard
- Must push to GitHub and connect Vercel for deployment
- Email confirmation may be required depending on Supabase project settings (can disable in Auth > Settings)

---

## Supabase table schemas

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
