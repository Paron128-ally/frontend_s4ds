/**
 * Every backend route the frontend calls, in one place.
 * Paths are relative to NEXT_PUBLIC_API_BASE_URL. Keep in sync with API_CONTRACT.md.
 */
const enc = encodeURIComponent;

export const ENDPOINTS = {
  // run lifecycle
  run: "/runs/current", //                        GET
  restartRun: "/runs/current/restart", //          POST
  freeze: "/runs/current/freeze", //               GET (status) · POST (freeze)
  pass1Stats: "/runs/current/pass1/stats", //      GET
  pass2Stats: "/runs/current/pass2/stats", //      GET

  // teams
  teams: "/teams", //                              GET (filters as query params)
  team: (id: string) => `/teams/${enc(id)}`, //    GET
  teamOverride: (id: string) => `/teams/${enc(id)}/override`, // POST

  // review queue
  disputes: "/disputes", //                        GET

  // intake
  ingest: "/ingest", //                            POST (?dryRun=true)
} as const;
