import type { ApiClient, FreezeResponse, FreezeStatus, RunState } from "@/types";
import { ENDPOINTS } from "./endpoints";
import { http } from "./http";

export const runsService: Pick<ApiClient, "getRun" | "restartRun" | "getFreezeStatus" | "freezeShortlist"> = {
  getRun: () => http<RunState>(ENDPOINTS.run),
  restartRun: () => http<RunState>(ENDPOINTS.restartRun, { method: "POST" }),
  getFreezeStatus: () => http<FreezeStatus>(ENDPOINTS.freeze),
  freezeShortlist: (payload) => http<FreezeResponse>(ENDPOINTS.freeze, { method: "POST", body: payload }),
};
