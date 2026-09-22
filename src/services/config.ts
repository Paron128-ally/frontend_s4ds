/**
 * Runtime configuration for the services layer.
 * Values come from .env.local (see .env.example). NEXT_PUBLIC_* variables are
 * inlined at build time, so restart `next dev` / rebuild after changing them.
 *
 * (The mock/real switch itself lives in services/index.ts.)
 */

/** Backend base URL, e.g. http://localhost:4000/api/v1 (a relative "/api/v1" also works behind a proxy). */
export const API_BASE_URL: string | undefined = process.env.NEXT_PUBLIC_API_BASE_URL;
