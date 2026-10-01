import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRunScores, getRunShortlist, getRunTeamsExport, postRunOverride } from "@/api/generated/endpoints";
import type { Pass1ScoreRow } from "@/api/generated/model";
import { applyTeamFilters, mergeShortlist, scoresToTeams, toOverrideBody } from "@/lib/api-mappers";
import { queryKeys } from "@/lib/query-keys";
import { useActiveRunId } from "@/store/runStore";
import type { OverridePayload, TeamFilters } from "@/types";

const PAGE_SIZE = 200;

export async function fetchAllScores(runId: string): Promise<Pass1ScoreRow[]> {
  const first = await getRunScores(runId, { page: 1, limit: PAGE_SIZE });
  const rows = [...first.data];
  const pages = Math.ceil(first.total / (first.limit || PAGE_SIZE));
  for (let page = 2; page <= pages; page += 1) {
    const next = await getRunScores(runId, { page, limit: PAGE_SIZE });
    rows.push(...next.data);
  }
  return rows;
}

export function useCohort() {
  const runId = useActiveRunId();
  return useQuery({
    queryKey: runId ? queryKeys.cohort(runId) : ["cohort", "none"],
    enabled: !!runId,
    queryFn: async () => {
      const [scores, shortlist] = await Promise.all([fetchAllScores(runId!), getRunShortlist(runId!)]);
      return mergeShortlist(scoresToTeams(scores), shortlist);
    },
    refetchInterval: 5000,
  });
}

export function useTeams(filters?: TeamFilters) {
  const cohort = useCohort();
  return {
    ...cohort,
    data: cohort.data ? applyTeamFilters(cohort.data, filters) : undefined,
  };
}

export function useTeam(id: string) {
  const cohort = useCohort();
  return {
    ...cohort,
    data: id ? (cohort.data?.find((team) => team.id === id) ?? null) : null,
  };
}

export function useDownloadTeamsExport() {
  const runId = useActiveRunId();
  return useMutation({
    mutationFn: async () => {
      if (!runId) throw new Error("Ingest a cohort before downloading.");
      return getRunTeamsExport(runId);
    },
  });
}

export function useApplyOverride() {
  const queryClient = useQueryClient();
  const runId = useActiveRunId();
  return useMutation({
    mutationFn: (payload: OverridePayload) => {
      if (!runId) throw new Error("Ingest a cohort before applying an override.");
      return postRunOverride(runId, toOverrideBody(payload));
    },
    onSuccess: () => {
      if (!runId) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.cohort(runId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.run(runId) });
    },
  });
}
