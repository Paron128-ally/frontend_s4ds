import { http } from "@/services/http";

type QueryValue = string | number | boolean | null | undefined;

/**
 * Orval fetch mutator. Generated calls pass a path (query string included)
 * and a `RequestInit` whose `body` is already `JSON.stringify`'d.
 * Responses are unwrapped to the inner `data` payload, or `{ data, total, page, limit }`
 * for paginated routes.
 */
export async function orvalMutator<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase() as "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  const [pathname, search] = path.split("?");
  const query = search ? Object.fromEntries(new URLSearchParams(search)) : undefined;

  let body: unknown;
  if (typeof init.body === "string" && init.body.length > 0) {
    body = JSON.parse(init.body) as unknown;
  } else if (init.body !== undefined && init.body !== null) {
    body = init.body;
  }

  const raw = await http<unknown>(pathname, {
    method,
    query: query as Record<string, QueryValue> | undefined,
    body,
    signal: init.signal ?? undefined,
  });

  return unwrap<T>(raw);
}

function unwrap<T>(body: unknown): T {
  if (!body || typeof body !== "object" || !("data" in body) || !("success" in body)) {
    return body as T;
  }
  const envelope = body as {
    data: unknown;
    total?: number;
    page?: number;
    limit?: number;
  };
  if (typeof envelope.total === "number") {
    return {
      data: envelope.data,
      total: envelope.total,
      page: envelope.page,
      limit: envelope.limit,
    } as T;
  }
  return envelope.data as T;
}
