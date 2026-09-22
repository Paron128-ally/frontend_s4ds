import { useQuery } from "@tanstack/react-query";
import { api } from "@/services";

export function usePass1Stats() {
  return useQuery({
    queryKey: ["pass1Stats"],
    queryFn: () => api.getPass1Stats(),
    refetchInterval: 5000,
  });
}

export function usePass2Stats() {
  return useQuery({
    queryKey: ["pass2Stats"],
    queryFn: () => api.getPass2Stats(),
    refetchInterval: 5000,
  });
}
