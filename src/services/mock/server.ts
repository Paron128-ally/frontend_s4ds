/**
 * Reference implementation of API_CONTRACT.md, backed by the in-memory mock data.
 *
 *   npm run mock:api                 -> http://localhost:4000/api/v1
 *
 * Then set NEXT_PUBLIC_USE_MOCKS=false in .env.local and restart `npm run dev`
 * to run the UI against real HTTP calls.
 *
 * This is NOT a backend: state lives in this process and resets when it stops.
 * Its job is to show — executably — the routes, query params, payloads, status
 * codes and error format the real backend has to provide.
 */
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { TeamFilters } from "@/types";
import { mockApi } from "./mockApi";

const PORT = Number(process.env.MOCK_API_PORT ?? 4000);
const PREFIX = "/api/v1";

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
  }
}

type Ctx = { params: string[]; query: URLSearchParams; body: unknown };
type Handler = (ctx: Ctx) => Promise<{ status?: number; data?: unknown }>;

// ---------------------------------------------------------------- validation

const SORT_KEYS = ["rank", "composite", "p2Score", "name", "id"] as const;

function parseFilters(q: URLSearchParams): TeamFilters {
  const num = (key: string) => {
    const raw = q.get(key);
    if (raw === null || raw === "") return undefined;
    const n = Number(raw);
    if (Number.isNaN(n)) throw new HttpError(400, `Query param "${key}" must be a number`);
    return n;
  };

  const sortBy = q.get("sortBy") ?? undefined;
  if (sortBy && !(SORT_KEYS as readonly string[]).includes(sortBy)) {
    throw new HttpError(400, `Query param "sortBy" must be one of: ${SORT_KEYS.join(", ")}`);
  }
  const sortOrder = q.get("sortOrder") ?? undefined;
  if (sortOrder && sortOrder !== "asc" && sortOrder !== "desc") {
    throw new HttpError(400, 'Query param "sortOrder" must be "asc" or "desc"');
  }

  return {
    search: q.get("search") ?? undefined,
    status: q.get("status") ?? undefined,
    band: q.get("band") ?? undefined,
    track: q.get("track") ?? undefined,
    minScore: num("minScore"),
    maxScore: num("maxScore"),
    integrityOnly: q.get("integrityOnly") === "true" ? true : undefined,
    overriddenOnly: q.get("overriddenOnly") === "true" ? true : undefined,
    sortBy: sortBy as TeamFilters["sortBy"],
    sortOrder: sortOrder as TeamFilters["sortOrder"],
  };
}

const asObject = (body: unknown): Record<string, unknown> =>
  body && typeof body === "object" ? (body as Record<string, unknown>) : {};

function requireAuditorId(body: Record<string, unknown>): string {
  if (typeof body.auditorId !== "string" || !body.auditorId.trim()) {
    throw new HttpError(400, "auditorId is required");
  }
  return body.auditorId.trim();
}

async function assertNotFrozen() {
  if ((await mockApi.getRun()).status === "FROZEN") {
    throw new HttpError(409, "The shortlist is frozen and can no longer be changed");
  }
}

// -------------------------------------------------------------------- routes

const routes: { method: string; pattern: RegExp; handler: Handler }[] = [
  { method: "GET", pattern: /^\/runs\/current$/, handler: async () => ({ data: await mockApi.getRun() }) },
  {
    method: "POST",
    pattern: /^\/runs\/current\/restart$/,
    handler: async () => ({ data: await mockApi.restartRun() }),
  },
  {
    method: "GET",
    pattern: /^\/runs\/current\/freeze$/,
    handler: async () => ({ data: await mockApi.getFreezeStatus() }),
  },
  {
    method: "POST",
    pattern: /^\/runs\/current\/freeze$/,
    handler: async ({ body }) => {
      const b = asObject(body);
      const size = b.shortlistSize;
      if (typeof size !== "number" || !Number.isInteger(size) || size < 1) {
        throw new HttpError(400, "shortlistSize must be a positive integer");
      }
      const auditorId = requireAuditorId(b);
      await assertNotFrozen();
      return { data: await mockApi.freezeShortlist({ shortlistSize: size, auditorId }) };
    },
  },
  {
    method: "GET",
    pattern: /^\/runs\/current\/pass1\/stats$/,
    handler: async () => ({ data: await mockApi.getPass1Stats() }),
  },
  {
    method: "GET",
    pattern: /^\/runs\/current\/pass2\/stats$/,
    handler: async () => ({ data: await mockApi.getPass2Stats() }),
  },
  {
    method: "GET",
    pattern: /^\/teams$/,
    handler: async ({ query }) => ({ data: await mockApi.getTeams(parseFilters(query)) }),
  },
  {
    method: "GET",
    pattern: /^\/teams\/([^/]+)$/,
    handler: async ({ params }) => {
      const team = await mockApi.getTeam(decodeURIComponent(params[0]));
      if (!team) throw new HttpError(404, `Team ${decodeURIComponent(params[0])} not found`);
      return { data: team };
    },
  },
  {
    method: "POST",
    pattern: /^\/teams\/([^/]+)\/override$/,
    handler: async ({ params, body }) => {
      const teamId = decodeURIComponent(params[0]);
      const b = asObject(body);
      const score = b.overrideScore;
      if (typeof score !== "number" || Number.isNaN(score) || score < 0 || score > 10) {
        throw new HttpError(400, "overrideScore must be a number between 0 and 10");
      }
      if (typeof b.auditorNote !== "string" || b.auditorNote.trim().length < 15) {
        throw new HttpError(400, "auditorNote must be at least 15 characters");
      }
      const auditorId = requireAuditorId(b);
      if (!(await mockApi.getTeam(teamId))) throw new HttpError(404, `Team ${teamId} not found`);
      await assertNotFrozen();
      return {
        data: await mockApi.applyOverride({
          teamId,
          overrideScore: score,
          auditorNote: b.auditorNote.trim(),
          auditorId,
        }),
      };
    },
  },
  { method: "GET", pattern: /^\/disputes$/, handler: async () => ({ data: await mockApi.getDisputes() }) },
  {
    method: "POST",
    pattern: /^\/ingest$/,
    handler: async ({ query }) => ({ data: await mockApi.startIngest(query.get("dryRun") === "true") }),
  },
];

// ------------------------------------------------------------------ plumbing

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function send(res: ServerResponse, status: number, data?: unknown) {
  const payload = data === undefined ? "" : JSON.stringify(data);
  res.writeHead(status, {
    ...CORS,
    ...(payload ? { "Content-Type": "application/json; charset=utf-8" } : {}),
  });
  res.end(payload);
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpError(400, "Request body is not valid JSON");
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const method = req.method ?? "GET";
  let status = 200;

  try {
    if (method === "OPTIONS") {
      status = 204;
      return send(res, 204);
    }
    if (!url.pathname.startsWith(PREFIX)) throw new HttpError(404, "Not found");

    const path = url.pathname.slice(PREFIX.length) || "/";
    const candidates = routes.filter((r) => r.pattern.test(path));
    if (candidates.length === 0) throw new HttpError(404, "Not found");

    const route = candidates.find((r) => r.method === method);
    if (!route) throw new HttpError(405, `Method ${method} not allowed on ${path}`);

    const params = (path.match(route.pattern) ?? []).slice(1);
    const body = method === "POST" ? await readJson(req) : undefined;
    const result = await route.handler({ params, query: url.searchParams, body });
    status = result.status ?? 200;
    send(res, status, result.data);
  } catch (err) {
    status = err instanceof HttpError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Internal error";
    send(res, status, { message: status === 500 ? "Internal server error" : message });
    if (status === 500) console.error(err);
  } finally {
    if (process.env.MOCK_API_QUIET !== "1") console.log(`${method.padEnd(7)} ${url.pathname}${url.search} -> ${status}`);
  }
});

server.listen(PORT, () => {
  console.log(`Mock API listening on http://localhost:${PORT}${PREFIX}`);
  console.log("Set NEXT_PUBLIC_USE_MOCKS=false and NEXT_PUBLIC_API_BASE_URL=" + `http://localhost:${PORT}${PREFIX}`);
});
