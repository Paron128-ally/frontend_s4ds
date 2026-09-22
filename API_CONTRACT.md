# KnowCode Evaluation Console — API Contract

What the frontend sends and expects back. `npm run mock:api` starts a runnable reference
implementation of exactly this contract, so anything below can be tried with `curl` (see §5).

| Where | What |
|---|---|
| `src/types/index.ts`, `src/types/api.ts` | The exact TypeScript shapes (source of truth) |
| `src/services/endpoints.ts` | Every route the frontend calls |
| `src/services/mock/server.ts` | Runnable reference server: `npm run mock:api` → `http://localhost:4000/api/v1` |

---

## 1. Conventions

- **Base URL**: `NEXT_PUBLIC_API_BASE_URL` (e.g. `http://localhost:4000/api/v1`). Paths below are relative to it.
- **Format**: JSON in and out (`Content-Type: application/json`). Timestamps are ISO-8601 UTC strings
  (`"2026-09-20T07:15:00Z"`). **All scores are decimals on a 0–10 scale.** Costs are USD numbers.
- **Absent vs. null**: an optional field that has no value should be **omitted**. `null` is tolerated
  (the client drops nulls while parsing) — but never send `0`, `""` or `"N/A"` to mean "not scored".
  The UI decides "scored / not scored" purely by whether `pass1` / `pass2Score` is present.
- **Errors**: any non-2xx response should carry `{ "message": "human readable text" }`. The UI shows
  `message` to the user (form errors, and a red banner when a data request fails).
- **Status codes used**: `200` OK · `400` validation failed · `401/403` auth (see §6) · `404` unknown team/route ·
  `409` run is frozen · `500` server error. `204` is accepted anywhere there is no body.
- **CORS**: if the frontend is served from a different origin, allow it (`GET, POST, OPTIONS`;
  headers `Content-Type, Authorization`) and answer `OPTIONS` preflights with `204`.
- **Polling**: only `GET /runs/current` is polled (every 5 s while `status === "RUNNING"`). Everything else
  is fetched on page load and re-fetched after mutations.

## 2. Endpoints

| # | Method & path | Purpose | Success body |
|---|---|---|---|
| 1 | `GET /runs/current` | Live run state (header telemetry, dashboard) | `RunState` |
| 2 | `POST /runs/current/restart` | Reset the run and clear any freeze (admin) | `RunState` |
| 3 | `GET /runs/current/freeze` | Is the shortlist frozen? | `FreezeStatus` |
| 4 | `POST /runs/current/freeze` | Freeze the shortlist (auditor/admin) | `FreezeResponse` |
| 5 | `GET /runs/current/pass1/stats` | Pass-1 monitor + dashboard charts | `Pass1Stats` |
| 6 | `GET /runs/current/pass2/stats` | Pass-2 monitor | `Pass2Stats` |
| 7 | `GET /teams` | Team list with filters/sort | `TeamsResponse` |
| 8 | `GET /teams/{id}` | One team (404 if unknown) | `Team` |
| 9 | `POST /teams/{id}/override` | Auditor score override (auditor/admin) | `OverrideResponse` |
| 10 | `GET /disputes` | Review queue | `DisputeItem[]` |
| 11 | `POST /ingest?dryRun=true` | Validate/queue registrations | `IngestResult` |

### 2.1 `GET /runs/current` → `RunState`

```json
{
  "id": "run-kc4-20260920", "status": "RUNNING", "startedAt": "2026-09-20T07:15:00Z",
  "elapsedSeconds": 13340,
  "totalTeams": 250, "completeTeams": 238, "incompleteTeams": 12,
  "p1Completed": 214, "p1Queued": 24,
  "p2Promoted": 143, "p2Completed": 96, "p2Running": 27, "p2Queued": 20,
  "shortlistSize": 50, "maxShortlistTarget": 50,
  "activeWorkers": 42, "totalWorkers": 50,
  "estimatedCost": 12.48, "p1Cost": 8.42, "p2Cost": 4.06, "budgetLimit": 20,
  "isBudgetKillSwitchTriggered": false,
  "currentStage": "PASS_2"
}
```

`status`: `IDLE | RUNNING | PAUSED | COMPLETED | FAILED | FROZEN`.
`currentStage`: `INGEST | PASS_1 | PASS_2 | SYNTHESIS | RANKING | HUMAN_GATE | FROZEN`.
When frozen, also send `frozenAt` and `frozenBy`. The UI reads `id`, `startedAt`, `elapsedSeconds`, `totalTeams`,
`incompleteTeams`, `p2Promoted`, `p2Completed`, worker and cost fields directly — **it no longer has fallback values.**

### 2.2 `POST /runs/current/restart` → `RunState`
No body. Resets the run to `RUNNING` and clears the freeze record (so `GET …/freeze` → `isFrozen:false`).

### 2.3 `GET /runs/current/freeze` → `FreezeStatus`
```json
{ "isFrozen": false }
```
```json
{ "isFrozen": true, "summary": { "frozenAt": "2026-09-20T16:02:13Z", "frozenBy": "auditor-jane-doe",
  "shortlistCount": 49, "rejectedCount": 71, "overridesApplied": 2, "snapshotId": "snap-1789920133293" } }
```

### 2.4 `POST /runs/current/freeze`
Body `{ "shortlistSize": 50, "auditorId": "auditor-jane-doe" }` → `{ "success": true, "summary": FreezeSummary }`
- `400` if `shortlistSize` is not an integer ≥ 1, or `auditorId` is blank.
- `409` if already frozen. On success the run becomes `status:"FROZEN"`, `currentStage:"FROZEN"`.
- `summary.shortlistCount` may be **less** than `shortlistSize` if fewer teams qualify.

### 2.5 `GET /runs/current/pass1/stats` → `Pass1Stats`
```json
{
  "totalComplete": 238, "scoredCount": 214, "remainingCount": 24,
  "activeWorkers": 42, "idleWorkers": 8, "estimatedCost": 8.42,
  "meanScore": 6.41, "medianScore": 6.72,
  "bands": { "reject": 71, "borderline": 83, "fastTrack": 60 },
  "scoreBuckets": [ { "range": "0-1", "count": 0 }, { "range": "1-2", "count": 0 }, "…", { "range": "9-10", "count": 26 } ],
  "recentActivity": [
    { "id": "KC-0182", "time": "1 min ago", "status": "scored", "score": 8.4, "band": "FAST_TRACK" },
    { "id": "KC-0147", "time": "just now", "status": "processing" }
  ]
}
```
- `meanScore` / `medianScore`: over **scored** teams' Pass-1 `composite` (0–10). *(New: the Pass-1 page needs them.)*
- `bands`: counts of scored teams per Pass-1 band; the three add up to `scoredCount`.
- `scoreBuckets`: exactly 10 one-point buckets, `"0-1"` … `"9-10"`.
- `recentActivity`: newest first (≈10). `time` is shown verbatim (a display label such as `"2 mins ago"`).
  `score`/`band` only when `status:"scored"`.

### 2.6 `GET /runs/current/pass2/stats` → `Pass2Stats`
```json
{
  "promotedTotal": 143, "completed": 96, "running": 27, "queued": 20, "estimatedCost": 4.06,
  "streams": {
    "themeCritic":      { "completed": 135, "total": 143, "percentage": 94 },
    "builderCritic":    { "completed": 128, "total": 143, "percentage": 89 },
    "integrityChecker": { "completed": 131, "total": 143, "percentage": 91 },
    "judgeSynthesizer": { "completed": 118, "total": 143, "percentage": 82 }
  }
}
```

### 2.7 `GET /teams` → `TeamsResponse`
Returns `{ "teams": Team[], "total": 250, "filtered": 250 }` — `total` ignores filters, `filtered` = matches.
All query params are optional; omit a param instead of sending `ALL`.

| Param | Meaning |
|---|---|
| `search` | Case-insensitive substring over `id`, `name`, `theme`, `idea` |
| `status` | Exact `TeamStatus` |
| `band` | Exact Pass-1 band (`pass1.band`); teams without `pass1` never match |
| `track` | `new_idea` \| `existing_project` |
| `minScore`, `maxScore` | Bounds on Pass-1 `composite` (a team with no `pass1` counts as `0`) |
| `integrityOnly=true` | Only teams with a non-empty `integrityFlags` |
| `overriddenOnly=true` | Only teams with `overrideScore` set or `status:"OVERRIDE"` |
| `sortBy` | `rank` (default) \| `composite` \| `p2Score` \| `name` \| `id`, else `400` |
| `sortOrder` | `asc` (default) \| `desc`, else `400` |

Sorting notes (matches current UI behaviour): `rank` sorts by `finalRank` with unranked teams last;
`composite` / `p2Score` use **highest first when `sortOrder=asc`** and lowest first when `desc`
(see §6, item 4); missing scores sort last. Non-numeric `minScore`/`maxScore` → `400`.

### 2.8 `GET /teams/{id}` → `Team`
`404 { "message": "Team KC-9999 not found" }` if unknown (the client turns this into "not found", not an error).

### 2.9 `POST /teams/{id}/override`
Body:
```json
{ "overrideScore": 8.7, "auditorNote": "Verified live demo and commit history manually.", "auditorId": "auditor-jane-doe" }
```
Returns `{ "success": true, "team": Team }`.
- `400`: `overrideScore` not a number in 0–10 · `auditorNote` shorter than 15 characters (trimmed) · blank `auditorId`.
- `404` unknown team · `409` run is frozen.
- Effects: team gets `status:"OVERRIDE"`, `overrideScore`, `auditorNote`, `auditorId`, new `updatedAt`.
  If the team has a dispute, that dispute becomes `status:"RESOLVED"` with `proposedScore = overrideScore`
  and the auditor fields copied.

### 2.10 `GET /disputes` → `DisputeItem[]`
```json
[{ "id": "disp-001", "teamId": "KC-0042", "teamName": "Team Autonomous 42", "projectTitle": "DeFi Compliance Oracle",
   "currentScore": 8.4, "proposedScore": 9.2, "band": "FAST_TRACK",
   "reason": "Auditor requested review: …", "aiVerdictSummary": "High builder signal (9.2), …",
   "status": "RESOLVED", "auditorId": "auditor-jane-doe", "auditorNote": "Reviewed trace and awarded 9.2 …",
   "createdAt": "2026-09-20T08:15:00Z" }]
```
`status`: `PENDING | RESOLVED | DISMISSED`. The dashboard's "Disputes" badge = number of `PENDING` items.

### 2.11 `POST /ingest?dryRun=true` → `IngestResult`
No body. `dryRun=true` only reports; without it the backend queues complete teams for Pass-1.
```json
{ "dryRun": true, "rowsDetected": 250, "complete": 238, "incomplete": 12, "queuedForP1": 238,
  "incompleteList": [ { "id": "KC-0001", "name": "Team Neural 1", "reasons": ["Idea description lacks core architecture and scope"] } ] }
```

---

## 3. Data shapes

**Enums**
- `TeamStatus`: `INCOMPLETE | P1_QUEUED | P1_DONE | REJECT | P2_QUEUED | P2_DONE | SHORTLIST | OVERRIDE`
- `Pass1Band`: `REJECT | BORDERLINE | FAST_TRACK` · `Track`: `new_idea | existing_project`

**`Team`** — which fields exist depends on how far the team got:

| Field | Type | Present when |
|---|---|---|
| `id`, `name`, `idea`, `track`, `projectLinks[]`, `status`, `createdAt`, `updatedAt` | | always |
| `theme`, `memberCount` | string, number | optional (`memberCount` is shown in the Ingest table; `—` if absent) |
| `incompleteReasons[]` | string[] | `status:"INCOMPLETE"` |
| `pass1` | `Pass1Score` | Pass-1 finished (**absent = not scored**) |
| `pass2Score` (0–10), `pass2Verdict[]`, `critique`, `evidenceLinks[]` | | Pass-2 finished |
| `integrityFlags[]` | string[] | only if flagged |
| `finalRank` | number | shortlisted teams |
| `overrideScore`, `auditorId`, `auditorNote` | | after an override |

`Pass1Score` = `{ problemClarity, originality, execution, feasibility, articulation, composite }` (each 0–10)
+ `reasons` (a string per criterion) + `track` + `band`. `critique` = `themeCritic`, `builderCritic`,
`integrityChecker` objects — see `SpecialistCritique` in `src/types/index.ts` for the full field list.
Registration time shown in the UI is `createdAt`.

Trimmed example (a Pass-2-complete team):
```json
{ "id": "KC-0088", "name": "Team Dynamic 88", "theme": "Voice Synthesis Shield", "track": "new_idea",
  "memberCount": 1, "projectLinks": ["https://github.com/knowcode4/kc-0088-service"],
  "status": "P2_DONE",
  "pass1": { "problemClarity": 7.8, "originality": 7.3, "execution": 7.8, "feasibility": 7.3, "articulation": 7.6,
             "composite": 7.59, "reasons": { "problemClarity": "…", "originality": "…", "execution": "…", "feasibility": "…", "articulation": "…" },
             "track": "new_idea", "band": "BORDERLINE" },
  "pass2Score": 7.9, "pass2Verdict": ["Solid engineering rigour …", "…"],
  "critique": { "themeCritic": { "…": "…" }, "builderCritic": { "…": "…" }, "integrityChecker": { "status": "FLAGGED", "…": "…" } },
  "evidenceLinks": [{ "label": "GitHub Repository", "url": "https://github.com/…", "type": "github" }],
  "integrityFlags": ["Resume reuse detected across two distinct team submissions"],
  "createdAt": "2026-09-20T06:00:00Z", "updatedAt": "2026-09-20T08:30:00Z" }
```

## 4. Rules the backend must enforce (the UI cannot)

1. **Freeze is final**: after `POST …/freeze`, reject overrides and further freezes with `409` until `restart`.
2. **Roles**: the UI's role switcher is cosmetic. Enforce server-side: override & freeze → `auditor`/`admin`; restart → `admin`.
3. **Validation**: repeat the checks in §2.4 / §2.9 — never rely on the browser.
4. **Consistency**: `pass1Stats.bands` sums to `scoredCount`; `RunState` counts should agree with `/teams`.

## 5. Try it without a backend

```bash
npm run mock:api                       # terminal 1 — serves this contract on :4000
# .env.local:  NEXT_PUBLIC_USE_MOCKS=false
#              NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
npm run dev                            # terminal 2 — UI now makes real HTTP calls
curl "http://localhost:4000/api/v1/teams?band=FAST_TRACK&sortBy=composite&sortOrder=desc"
```
The stub keeps state in memory and resets when stopped. It reproduces the responses and error codes above.

## 6. Open decisions (need an owner)

1. **Auth** — nothing is wired: the login page and the "Jane Doe" user in the header are placeholders. Once a scheme is chosen,
   attach credentials in one place: `authHeaders()` in `src/services/http.ts`.
2. **`auditorId` in request bodies** — the UI sends it. A backend should take the identity from the session and
   ignore/verify the body value, otherwise a client can sign as anyone.
3. **Activity feed** — the dashboard "Live Activity" panel is fed by `pass1Stats.recentActivity` (Pass-1 events only).
   Budget alerts, disputes filed, worker autoscaling etc. would need a dedicated events endpoint.
4. **Score sort direction** — for `composite` / `p2Score`, `sortOrder=asc` currently returns *highest first*, which
   contradicts the toggle's label. Either keep as documented or fix both sides together (backend + default order in the UI).
5. **List size** — `GET /teams` returns full teams (incl. critique) — fine for ~250; add pagination or a slim list shape if it grows.
6. **`recentActivity[].time`** — a display string is fragile (goes stale between polls). Prefer sending an ISO timestamp and
   letting the UI format it; that is a small UI change to make when the real backend exists.
