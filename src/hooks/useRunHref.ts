"use client";

import { runPath } from "@/lib/run-path";
import { useActiveRunId } from "@/store/runStore";

export function useRunHref(segment: string): string {
  const runId = useActiveRunId();
  if (!runId) return "/";
  return runPath(runId, segment);
}
