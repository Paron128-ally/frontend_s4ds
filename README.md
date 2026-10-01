# KnowCode 4.0 — Evaluation Console (frontend)

This frontend is a Next.js 16 + React 19 + TypeScript application using Tailwind CSS 3 and a manually maintained shadcn/ui component set. The project is structured around TanStack Query, Zustand, Recharts, @xyflow/react, Zod validation, and an Orval client for the FastAPI backend. See [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md).

## Technology stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 3
- manually maintained shadcn/ui components
- TanStack Query
- Zustand
- Recharts
- @xyflow/react
- Zod
- Auth.js architecture (session token support via bearer headers when configured)
- FastAPI REST backend support through `NEXT_PUBLIC_API_BASE_URL`

## Run it

```bash
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
npm run dev                  # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | `eslint .` |
| `npm run generate:api` | Refresh `openapi/backend.openapi.json` (if the backend is up) and regenerate the Orval client |

## Configuration

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

- Point this at the FastAPI app. The value includes the `/api/v1` prefix; generated paths are relative to it.
- `npm run generate:api` writes `src/api/generated` from the pinned OpenAPI snapshot.
- Auth headers can later be attached in `src/services/http.ts`.

## Structure

```
frontend/
├── src/
│   ├── app/            App Router pages and route-level views
│   ├── components/
│   │   ├── ui/         manually maintained shadcn/ui primitives
│   │   ├── dashboard/  Dashboard widgets and metrics
│   │   ├── freeze/     Freeze workflow and override forms
│   │   ├── layout/     Shell, sidebar, page container
│   │   ├── pipeline/   @xyflow/react DAG visualizations
│   │   ├── review/     Dispute and verdict UIs
│   │   ├── scores/     scoring breakdown and charts
│   │   └── teams/      team table and filters
│   ├── hooks/          TanStack Query hooks
│   ├── lib/            shared helpers and formatters
│   ├── schemas/        Zod validation schemas
│   ├── services/       HTTP client (`http.ts`) and `ApiError`
│   ├── store/          Zustand UI state
│   └── types/          domain and API contract models
├── public/             static assets
├── API_CONTRACT.md     backend contract for the frontend
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

## Data flow

```
page/component → hook → Orval client → http.ts → FastAPI
```

Hooks are the only place that calls generated API functions. See [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md) for env vars, codegen, and the route map.

## Backend expectations

The live API is the FastAPI app under `backend/`. CORS for local Next.js uses `frontend_url: http://localhost:3000` in `backend/secrets/dev.config.yaml`.

- Authorization remains backend-authoritative; local UI role switching is not real security

## Conventions

- Missing data is displayed as `—`, never invented.
- `0` is a valid score and must be treated as a real value.
- Model state is intentionally explicit: `field !== undefined` is used when a value is considered present.
- The Pass-1 rubric remains authoritative:
  - Problem Clarity & Relevance — 20%
  - Idea / Feature Originality — 25%
  - Scope-Adjusted Execution — 30%
  - Feasibility Judgment — 10%
  - Articulation — 15%
- Composite formula:
  `0.20*clarity + 0.25*originality + 0.30*execution + 0.10*feasibility + 0.15*articulation`

## Important notes

- This project does not use the shadcn CLI to generate components; the UI components are already maintained in `src/components/ui`.
