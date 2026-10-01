"use client";

import { usePathname } from "next/navigation";
import { runIdFromPathname } from "@/lib/run-path";

/** Active run from the URL (`/{runId}/...`). */
export function useActiveRunId(): string | null {
  const pathname = usePathname();
  return runIdFromPathname(pathname);
}

export function useRequiredRunId(): string {
  const runId = useActiveRunId();
  if (!runId) {
    throw new Error("Open a run from the home page first.");
  }
  return runId;
}
