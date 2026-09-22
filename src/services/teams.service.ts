import type { ApiClient, OverrideResponse, Team, TeamFilters, TeamsResponse } from "@/types";
import { ENDPOINTS } from "./endpoints";
import { ApiError, http } from "./http";

/** The UI uses "ALL" to mean "no filter"; the backend should never see it. */
const unlessAll = (value?: string) => (value && value !== "ALL" ? value : undefined);

export const teamsService: Pick<ApiClient, "getTeams" | "getTeam" | "applyOverride"> = {
  getTeams(filters?: TeamFilters) {
    return http<TeamsResponse>(ENDPOINTS.teams, {
      query: {
        search: filters?.search?.trim(),
        status: unlessAll(filters?.status),
        band: unlessAll(filters?.band),
        track: unlessAll(filters?.track),
        minScore: filters?.minScore,
        maxScore: filters?.maxScore,
        integrityOnly: filters?.integrityOnly || undefined,
        overriddenOnly: filters?.overriddenOnly || undefined,
        sortBy: filters?.sortBy,
        sortOrder: filters?.sortOrder,
      },
    });
  },

  async getTeam(id: string) {
    try {
      return await http<Team>(ENDPOINTS.team(id));
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  },

  applyOverride({ teamId, ...body }) {
    return http<OverrideResponse>(ENDPOINTS.teamOverride(teamId), { method: "POST", body });
  },
};
