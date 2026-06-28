# PokerNights — Claude Code Instructions

Read this file at the start of every session before touching any code.
After completing any task, update MEMORY.md with what you did.

---

## What is this app
PokerNights is a mobile-first poker session tracker PWA for friend groups.
- Players log buy-ins, hands, and profit/loss per session
- Leaderboard tracks stats monthly, quarterly, and all-time
- Each friend signs up with their own account

## Tech stack
- React 18 (Create React App)
- Supabase — database + auth (email/password)
- Vercel — auto-deploys when you push to GitHub main branch

## Project structure
```
poker-nights/
  src/
    App.js          ← all app code lives here (one file)
    index.js
    index.css       ← global resets only
  public/
  .env              ← real keys (gitignored)
  .env.example      ← placeholder keys (committed)
  .gitignore
  package.json
  CLAUDE.md
  MEMORY.md
```

## Environment variables
All Supabase calls use:
- `process.env.REACT_APP_SUPABASE_URL`
- `process.env.REACT_APP_SUPABASE_ANON_KEY`

Never hardcode keys. Copy `.env.example` to `.env` and fill in real values.

## Coding conventions
- All app code in ONE file: `src/App.js`
- Keep all styles inline (no CSS files beyond global reset)
- Mobile-first layout (max-width ~430px centered)
- No TypeScript — plain JavaScript only
- No Redux — use React useState/useEffect

## Design tokens
- Background: `#1a472a` (dark green felt)
- Gold accent: `#FFD700`
- Card suits: ♠ ♥ ♦ ♣
- Text: white on dark backgrounds

## App structure — 4 bottom nav tabs
1. Leaderboard — monthly/quarterly/all-time rankings
2. My Stats — personal profit/loss, sessions, hours, VPIP%
3. Start Game — session timer, hand logger, buy-in input
4. Profile — username, stats summary, sign out

## Auth flow
- Email + password signup/login via Supabase Auth
- After first login → prompt for username (saved to `profiles` table)
- Session persisted via Supabase's built-in session handling

## Deploy workflow
1. Edit `src/App.js`
2. Run: `npm run build` (verify no errors)
3. Push to GitHub main branch
4. Vercel auto-deploys in ~60 seconds

## Rules for Claude Code
- Always run `npm run build` before pushing to verify no errors
- Only edit `src/App.js` unless told otherwise
- After each session update `MEMORY.md`
- Ask before making any structural changes to the app
- Keep all styles inline
