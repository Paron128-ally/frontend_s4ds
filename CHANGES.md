# Change log — original project → this version

(Cumulative: includes the earlier `teams.filter` fixes, plus everything done in this round.)

## Files moved

| Before | Now |
|---|---|
| `app/` | `src/app/` |
| `components/` | `src/components/` (+ new `ui/`, `layout/ApiErrorBanner.tsx`) |
| `hooks/`, `store/`, `types/` | `src/hooks/`, `src/store/`, `src/types/` |
| `lib/utils.ts`, `lib/auth.ts` | `src/lib/` |
| `lib/api.ts` | `src/services/mock/mockApi.ts` + real HTTP layer in `src/services/` |
| `lib/mockData.ts` | `src/services/mock/mockData.ts` |
| — | `src/schemas/` (zod), `public/`, `.env.example`, `.gitignore`, `components.json`, `API_CONTRACT.md` |
| `tailwind.config.js` | `tailwind.config.ts` (content globs now `./src/**`) |
| `tsconfig.json` | `@/*` → `./src/*` |

Deleted: `setup.js` (broken one-liner nothing imported), empty `scripts/`, `tsconfig.tsbuildinfo` (generated).
Added deps: `zod`; dev: `tsx`. `package-lock.json` regenerated — `npm ci` now works (it failed before).

## Bugs fixed

- **`teams.filter is not a function`** — `useTeams()` returns `{ teams, total, filtered }`, not an array (Sidebar + 4 pages).
- **Six type errors** — `runId`→`id`; `registeredAt`→`createdAt`; `integrityFlag`→`integrityFlags`; `memberCount` added to `Team`; `meanScore`/`medianScore` added to Pass-1 stats.
- **Dashboard band chart never showed real data** — it read `stats.bandCounts` (doesn't exist) and fell back to a hardcoded 63/75/100/12; the Score Distribution chart was rendered with no props and always showed fake bands. Both now use the API (71 reject / 83 borderline / 60 fast-track on the mock data).
- **Fake data behind `??` fallbacks / literals removed** — header telemetry, run id/start/elapsed, budget & worker cards, sidebar counts, "250 registered / 12 incomplete", "of 150 eligible", "~190 teams", Pass-1 mean/median, freeze page numbers, and the static "Live Activity" feed (now `recentActivity` from the API).
- **`any` props** on `BandSummaryCard`, `BudgetCard`, `WorkerCard`, `StageFunnel` (which hid the bugs above) are now typed.
- **Score labels** said "/ 100 pts"; scores are 0–10.
- **Dashboard "Disputes" badge** now shows pending disputes (was an integrity-flag count that was always 0).
- **Freeze**: a blank signing key could freeze the (irreversible) shortlist — now blocked; a failed freeze request now shows an error instead of an unhandled rejection.
- **Sidebar collapse** read a non-existent `sidebarCollapsed`; now derived from `sidebarOpen`.
- **Unscored checks** used `!== null` (always true) — now `!== undefined`.
- Status pills on Pass-1/Pass-2 compared `status` to band names (never matched) — now use `pass1.band` and show the band.
- No error handling existed anywhere — added a failure banner and a retry policy (no retry on 4xx, two on network/5xx).

## Decisions you may want to revisit

- `memberCount` is an **optional** field on `Team` (the Ingest table has a "Members" column but no data source existed). Shows `—` if the backend omits it.
- Pass-1 reject count uses the band (`pass1.band === "REJECT"`), so reject + borderline + fast-track = scored teams.
- Score sorts return *highest first* for `sortOrder=asc` — kept as it was; see `API_CONTRACT.md` §6.

## Left as-is (not part of this task)

- Login and the "Jane Doe" user are placeholders; no real auth.
- `src/components/dashboard/*` (6 files: CostTicker, IncompleteWarningCard, RunStatusBanner, StageProgress, StatCard, WorkerPoolMeter) are imported nowhere — dead code, safe to delete.
- `next lint` isn't configured (no ESLint dependency).
- shadcn: `components.json` is set up but hand-written (the shadcn CLI couldn't be reached from where this was prepared) — if `npx shadcn@latest add button` complains, run `npx shadcn@latest init` once.
