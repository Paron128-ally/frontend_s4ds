import type { ApiClient, DisputeItem } from "@/types";
import { ENDPOINTS } from "./endpoints";
import { http } from "./http";

export const disputesService: Pick<ApiClient, "getDisputes"> = {
  getDisputes: () => http<DisputeItem[]>(ENDPOINTS.disputes),
};
