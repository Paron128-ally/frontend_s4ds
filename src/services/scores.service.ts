import type { ApiClient, Pass1Stats, Pass2Stats } from "@/types";
import { ENDPOINTS } from "./endpoints";
import { http } from "./http";

export const scoresService: Pick<ApiClient, "getPass1Stats" | "getPass2Stats"> = {
  getPass1Stats: () => http<Pass1Stats>(ENDPOINTS.pass1Stats),
  getPass2Stats: () => http<Pass2Stats>(ENDPOINTS.pass2Stats),
};
