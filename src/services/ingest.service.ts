import type { ApiClient, IngestResult } from "@/types";
import { ENDPOINTS } from "./endpoints";
import { http } from "./http";

export const ingestService: Pick<ApiClient, "startIngest"> = {
  startIngest: (dryRun = false) =>
    http<IngestResult>(ENDPOINTS.ingest, { method: "POST", query: { dryRun: dryRun || undefined } }),
};
