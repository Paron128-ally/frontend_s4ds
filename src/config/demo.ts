export type TelemetryMode = "hidden" | "static";

export const TELEMETRY_MODE: TelemetryMode = process.env.NEXT_PUBLIC_TELEMETRY_MODE === "static" ? "static" : "hidden";
export const PASS2_ENABLED = process.env.NEXT_PUBLIC_PASS2_ENABLED === "true";
export const SHOW_DISPUTES_BADGE = process.env.NEXT_PUBLIC_SHOW_DISPUTES_BADGE === "true";