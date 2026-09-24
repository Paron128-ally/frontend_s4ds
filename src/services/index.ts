import type { ApiClient } from "@/types";
import { USE_MOCK_DATA } from "@/config/demo";
import { httpApi } from "./http-api";

export { ApiError } from "./http";
export { ENDPOINTS } from "./endpoints";

/**
 * The one `api` object the whole app talks to (via the hooks in src/hooks).
 *
 * NEXT_PUBLIC_USE_MOCKS=true → in-memory mock data for explicit local testing only
 * Otherwise → real HTTP calls to NEXT_PUBLIC_API_BASE_URL
 *
 * The env check is written inline (not imported from config.ts) and the mock is
 * loaded with require() so the bundler can drop the mock data from a real-backend
 * production build entirely.
 */
function createApi(): ApiClient {
  if (USE_MOCK_DATA) {
    return (require("./mock/mockApi") as typeof import("./mock/mockApi")).mockApi;
  }
  return httpApi;
}

export const api: ApiClient = createApi();
