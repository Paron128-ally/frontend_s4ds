export const queryKeys = {
  run: (runId: string) => ["run", runId] as const,
  cohort: (runId: string) => ["cohort", runId] as const,
};
