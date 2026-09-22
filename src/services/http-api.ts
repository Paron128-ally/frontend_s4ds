import type { ApiClient } from "@/types";
import { disputesService } from "./disputes.service";
import { ingestService } from "./ingest.service";
import { runsService } from "./runs.service";
import { scoresService } from "./scores.service";
import { teamsService } from "./teams.service";

/** The real backend client — every method is one HTTP call. */
export const httpApi: ApiClient = {
  ...runsService,
  ...teamsService,
  ...scoresService,
  ...disputesService,
  ...ingestService,
};
