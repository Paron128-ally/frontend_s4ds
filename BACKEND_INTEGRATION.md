# Backend integration

The console talks to the FastAPI app through an Orval client. Pages call hooks in `src/hooks`. Hooks call generated functions in `src/api/generated`. Those functions go through `src/api/orval-mutator.ts` into `src/services/http.ts`.

## Environment

Copy `frontend_s4ds/.env.example` to `frontend_s4ds/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

The value includes `/api/v1`. Generated paths are relative to it (`/ingest`, `/runs/{id}`).

Backend CORS for local Next.js is `frontend_url: http://localhost:3000` in `backend/secrets/dev.config.yaml`.

Restart `npm run dev` after changing env vars.

## Regenerating the client

From `frontend_s4ds`, with the backend running so the snapshot matches the current routes:

```bash
npm run generate:api
```

That refreshes `openapi/backend.openapi.json` and rewrites `src/api/generated`. Do not edit the generated files. Restart the backend before generating if route `operation_id`s changed; otherwise FastAPI emits long auto-generated names.

## Active run

The API is scoped by `run_id`. The UI uses URL paths `/{runId}/dashboard`, `/{runId}/pass1`, and so on. `/` lists runs; `/create` starts a new run (name + CSV). Hooks read the run id from the path, not from localStorage.

## Routes and hooks

| Backend route | Generated function | Hook |
|---|---|---|
| `GET /health` | `healthCheck` | Not used by a page |
| `GET /runs` | `listRuns` | `useRunsList` |
| `POST /ingest` | `ingestTeams` | `useStartIngest` (body includes `run_name`) |
| `GET /runs/{run_id}` | `getRun` | `useRun` |
| `GET /runs/{run_id}/progress` | `getRunProgress` | `useRun` |
| `GET /runs/{run_id}/scores` | `getRunScores` | `useTeams`, `useTeam`, `usePass1Stats` |
| `GET /runs/{run_id}/shortlist` | `getRunShortlist` | `useTeams`, `useTeam` |
| `POST /runs/{run_id}/overrides` | `postRunOverride` | `useApplyOverride` |
| `POST /runs/{run_id}/freeze` | `postRunFreeze` | `useFreezeShortlist` |
| `GET /runs/{run_id}/teams-export` | `getRunTeamsExport` | `useDownloadTeamsExport` |

Pass-1 stats, Pass-2 counts, and freeze status are derived in the hooks. There is no disputes, restart, or unfreeze route yet. See `todo.md`.

The ingest page uploads a registration CSV (same columns as `ai/scripts/input/reg.json`). The browser maps each row to `{ teams: [...] }` and posts that. Dry run only checks the file. It does not call the API.

## Smoke test

1. Backend: `alembic upgrade head`, API on port 8000. AI service on port 8100 if you want scoring to finish.
2. Frontend: `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1`, then `npm run dev`.
3. Open `/ingest`, upload the registration CSV, and dry-run it. Nothing is sent until Start Ingest.
4. Start ingest. The banner shows a run id. Dashboard polls while the run is active.
5. Pass-1 and Teams show scores after Pass-1 finishes.
6. Shortlist lists promoted teams after Pass-2.
7. On a team, apply an override, then freeze from `/freeze`.
8. The frozen shortlist stays on `/shortlist`.
