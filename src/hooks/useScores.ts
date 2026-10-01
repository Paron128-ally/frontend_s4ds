import { derivePass1Stats, derivePass2Stats } from "@/lib/api-mappers";
import { useRun } from "./useRuns";
import { useCohort } from "./useTeams";

export function usePass1Stats() {
  const cohort = useCohort();
  const run = useRun();
  const progress = run.data
    ? {
        run_id: run.data.id,
        status: run.data.status,
        phase: run.data.currentStage,
        total: run.data.totalTeams,
        scored: run.data.p1Completed,
        failed: run.data.incompleteTeams,
      }
    : undefined;
  return {
    ...cohort,
    data: cohort.data ? derivePass1Stats(cohort.data, progress) : undefined,
    isLoading: cohort.isLoading || run.isLoading,
  };
}

export function usePass2Stats() {
  const run = useRun();
  return {
    ...run,
    data: run.data ? derivePass2Stats(run.data) : undefined,
  };
}
