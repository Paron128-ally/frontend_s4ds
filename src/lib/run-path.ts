const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ROOT_SEGMENTS = new Set(["login", "create"]);

/** First path segment when it is a run UUID. */
export function runIdFromPathname(pathname: string): string | null {
  const segment = pathname.split("/").filter(Boolean)[0];
  if (!segment || ROOT_SEGMENTS.has(segment)) return null;
  return UUID_RE.test(segment) ? segment : null;
}

export function runPath(runId: string, segment: string): string {
  const path = segment.startsWith("/") ? segment.slice(1) : segment;
  return `/${runId}/${path}`;
}
