import { API_BASE_URL } from "./config";
import { getSession } from "@/lib/auth";

/** Thrown for every failed request. `status` is 0 when the server could not be reached at all. */
export class ApiError extends Error {
  readonly status: number;
  readonly url: string;
  readonly body?: unknown;

  constructor(message: string, status: number, url: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.url = url;
    this.body = body;
  }
}

type QueryValue = string | number | boolean | null | undefined;

/**
 * The UI models "not there yet" as an ABSENT field (e.g. `team.pass1 !== undefined` means "scored").
 * Many backends serialise missing values as `null`, and `null !== undefined` would silently flip
 * those checks — so nulls are dropped while parsing.
 */
const dropNulls = (_key: string, value: unknown) => (value === null ? undefined : value);

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, QueryValue>;
  body?: unknown;
  signal?: AbortSignal;
}

/**
 * Single place to attach credentials once auth exists.
 * Currently returns empty headers (mock mode).
 * When real Auth.js is wired, replace with:
 *   const session = await getServerSession(authOptions)  // or useClientSession()
 *   return session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {};
 */
function authHeaders(): Record<string, string> {
  // Mock mode: no Authorization header
  // Real backend: retrieve token from Auth.js session
  // const session = getSession(); // This would come from Auth.js client session
  // if (session?.accessToken) return { Authorization: `Bearer ${session.accessToken}` };
  return {};
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  if (API_BASE_URL === undefined) {
    throw new ApiError(
      "NEXT_PUBLIC_API_BASE_URL is not set. Add it to .env.local, or set NEXT_PUBLIC_USE_MOCKS=true.",
      0,
      path
    );
  }
  const url = `${API_BASE_URL.replace(/\/+$/, "")}${path}`;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

function messageFrom(body: unknown): string | undefined {
  if (body && typeof body === "object") {
    const b = body as Record<string, unknown>;
    for (const key of ["message", "detail", "error"]) {
      if (typeof b[key] === "string") return b[key] as string;
    }
  }
  return typeof body === "string" && body.length < 200 ? body : undefined;
}

export async function http<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = buildUrl(path, options.query);
  const hasBody = options.body !== undefined;

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? "GET",
      headers: {
        Accept: "application/json",
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...authHeaders(),
      },
      body: hasBody ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
      cache: "no-store",
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError(`Cannot reach the backend at ${url}`, 0, url);
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  const isJson = (response.headers.get("content-type") ?? "").includes("json");
  let body: unknown = text;
  if (text && isJson) {
    try {
      body = JSON.parse(text, dropNulls);
    } catch {
      throw new ApiError("Backend returned invalid JSON", response.status, url, text.slice(0, 200));
    }
  }

  if (!response.ok) {
    throw new ApiError(
      messageFrom(body) ?? `${response.status} ${response.statusText}`.trim(),
      response.status,
      url,
      body
    );
  }
  if (text && !isJson) {
    // e.g. a wrong base URL returning an HTML page with status 200
    throw new ApiError("Backend did not return JSON — check NEXT_PUBLIC_API_BASE_URL", response.status, url);
  }
  return body as T;
}
