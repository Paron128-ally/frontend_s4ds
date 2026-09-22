import { useQuery } from "@tanstack/react-query";
import { api } from "@/services";

export function useDisputes() {
  return useQuery({
    queryKey: ["disputes"],
    queryFn: () => api.getDisputes(),
  });
}
