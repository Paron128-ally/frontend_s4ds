# KnowCode 4.0 — Evaluation Console (frontend)

This frontend is a Next.js 16 + React 19 + TypeScript application using Tailwind CSS 3 and a manually maintained shadcn/ui component set. The project is structured around TanStack Query, Zustand, Recharts, @xyflow/react, Zod validation, and a mock-first API layer with a real backend path.

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
cp .env.example .env.local   # optional; defaults to mock mode when unset
npm run dev                  # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | `eslint .` |
| `npm run mock:api` | Start the bundled mock API server on `http://localhost:4000/api/v1` |

## Configuration

The frontend supports both mock and real backend modes.

```env
NEXT_PUBLIC_USE_MOCKS=true
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
```

- `NEXT_PUBLIC_USE_MOCKS=true` (default) uses the in-memory mock API.
- `NEXT_PUBLIC_USE_MOCKS=false` uses the real HTTP API client pointed at `NEXT_PUBLIC_API_BASE_URL`.
- The API client is structured so a real Auth.js session token can later be forwarded as:
  `Authorization: Bearer <token>`

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
│   ├── services/       API abstraction, mock mode, and HTTP client
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
page/component → hook → api abstraction
                      ├─ mock implementation (NEXT_PUBLIC_USE_MOCKS=true)
                      └─ HTTP implementation (NEXT_PUBLIC_USE_MOCKS=false)
```

The frontend intentionally keeps the mock API and real API surfaces aligned through the shared `ApiClient` contract in `src/types/api.ts`.

## Backend expectations

This project is designed to integrate with a FastAPI REST backend that exposes the routes documented in `API_CONTRACT.md`.

- Real backend mode is enabled with `NEXT_PUBLIC_USE_MOCKS=false`
- The UI stays mock-safe for local development without inventing backend authority
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
- The frontend is intended to run with either the provided mock mode or a real backend without a full migration or redesign.
