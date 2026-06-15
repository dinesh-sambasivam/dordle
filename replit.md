# Dordle

A mobile-first, Wordle-style word game with a daily Word of the Day and a 10,000-puzzle Challenge mode. No login, on-screen keyboard only, with shareable emoji results.

## Run & Operate

- `pnpm --filter @workspace/dordle run dev` — run the game (web artifact, served at `/`)
- `pnpm --filter @workspace/dordle run typecheck` — typecheck the Dordle artifact
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend-only React + Vite artifact (no backend/API used by the game)
- Routing: wouter
- Styling: Tailwind CSS v4 (`@theme inline` in `index.css`, HSL space-separated CSS vars; purple/cream theme)

## Where things live

- `artifacts/dordle/src/pages/` — `DailyGame`, `ChallengePicker`, `ChallengeGame`
- `artifacts/dordle/src/components/` — `Header`, `GameBoard`, `Keyboard`, `ResultModal`
- `artifacts/dordle/src/hooks/useGame.ts` — core game logic, guess evaluation, input lock during reveal
- `artifacts/dordle/src/lib/gameState.ts` — guess evaluation + keyboard state; `cookies.ts` — daily progress persistence
- `artifacts/dordle/src/data/` — source of truth for words:
  - `dailyWords.ts` — 700 Word-of-the-Day words (one per day from June 15 2026 = day 1) + `getTodayDateLabel()`
  - `challengeWords.ts` — 10,000 deterministic challenge words (indexed by number 1-10000)
  - `validWords.ts` — 14,855-word dictionary used to validate guesses

## Architecture decisions

- Word lists are generated from an attached spreadsheet; the valid-word dictionary is the union of all puzzle words plus a full English 5-letter word list, so every puzzle answer is always accepted as a guess.
- Daily progress is saved in a cookie (`dordle_daily_progress`, 2-day expiry); it invalidates on date change or a different daily number, so past days cannot be replayed.
- Challenge mode is stateless (no cookie) and fully deterministic by number, so users compete on the same puzzle.
- Tile reveal animation is staggered per tile; each row freezes its animation decision at mount and input is locked during the reveal window to prevent partial-reveal races.

## Product

- Word of the Day: one puzzle per day, date + puzzle number shown, progress saved, resets at midnight, no replay of past days.
- Challenge mode: pick any number 1-10000 to play that exact deterministic puzzle.
- On-screen QWERTY keyboard only; color feedback (green/yellow/grey) on tiles and keys.
- Shareable emoji-only results.

## User preferences

- No em dashes and no emojis in UI text. Emojis are allowed only in the shareable results output.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
