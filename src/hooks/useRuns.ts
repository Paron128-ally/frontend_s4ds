import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services";
import type { FreezePayload, IngestResult } from "@/types";

export function useRun() {
  return useQuery({
    queryKey: ["run"],
    queryFn: () => api.getRun(),
    refetchInterval: (query) => (query.state.data?.status === "RUNNING" ? 5000 : false),
  });
}

export function useRestartRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.restartRun(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["run"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["pass1Stats"] });
      queryClient.invalidateQueries({ queryKey: ["pass2Stats"] });
      queryClient.invalidateQueries({ queryKey: ["freezeStatus"] });
    },
  });
}

export function useFreezeStatus() {
  return useQuery({
    queryKey: ["freezeStatus"],
    queryFn: () => api.getFreezeStatus(),
  });
}

export function useFreezeShortlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FreezePayload) => api.freezeShortlist(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["run"] });
      queryClient.invalidateQueries({ queryKey: ["freezeStatus"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export function useStartIngest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dryRun: boolean) => api.startIngest(dryRun),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["run"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["pass1Stats"] });
    },
  });
}
