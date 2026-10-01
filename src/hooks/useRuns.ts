import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRun, getRunProgress, ingestTeams, listRuns, postRunFreeze } from "@/api/generated/endpoints";
import type { IngestRequest } from "@/api/generated/model";
import { mergeRunAndProgress, toFreezeBody, toFreezeStatus } from "@/lib/api-mappers";
import { queryKeys } from "@/lib/query-keys";
import { useActiveRunId } from "@/store/runStore";
import type { FreezePayload } from "@/types";
import { useTeams } from "./useTeams";

export function useRun() {
  const runId = useActiveRunId();
  return useQuery({
    queryKey: runId ? queryKeys.run(runId) : ["run", "none"],
    enabled: !!runId,
    queryFn: async () => {
      const [run, progress] = await Promise.all([getRun(runId!), getRunProgress(runId!)]);
      return mergeRunAndProgress(run, progress);
    },
    refetchInterval: (query) => (query.state.data?.status === "RUNNING" ? 5000 : false),
  });
}

export function useFreezeStatus() {
  const run = useRun();
  const teams = useTeams();
  return {
    ...run,
    data: run.data ? toFreezeStatus(run.data, teams.data?.teams ?? []) : undefined,
    isLoading: run.isLoading || teams.isLoading,
  };
}

export function useFreezeShortlist() {
  const queryClient = useQueryClient();
  const runId = useActiveRunId();
  return useMutation({
    mutationFn: async (payload: FreezePayload) => {
      if (!runId) throw new Error("Ingest a cohort before freezing.");
      toFreezeBody(payload);
      return postRunFreeze(runId);
    },
    onSuccess: () => {
      if (!runId) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.run(runId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.cohort(runId) });
    },
  });
}

export function useRunsList() {
  return useQuery({
    queryKey: ["runs", "list"],
    queryFn: () => listRuns({ page: 1, limit: 100 }),
  });
}

export function useStartIngest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: IngestRequest) => ingestTeams(body),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["runs", "list"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.run(result.run_id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.cohort(result.run_id) });
    },
  });
}
