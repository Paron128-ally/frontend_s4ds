import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services";
import type { OverridePayload, TeamFilters } from "@/types";

export function useTeams(filters?: TeamFilters) {
  return useQuery({
    queryKey: ["teams", filters],
    queryFn: () => api.getTeams(filters),
  });
}

export function useTeam(id: string) {
  return useQuery({
    queryKey: ["team", id],
    queryFn: () => api.getTeam(id),
    enabled: !!id,
  });
}

export function useApplyOverride() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OverridePayload) => api.applyOverride(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["team", data.team.id] });
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
      queryClient.invalidateQueries({ queryKey: ["run"] });
    },
  });
}
