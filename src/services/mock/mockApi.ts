/**
 * In-memory implementation of the API used while the real backend does not exist
 * (NEXT_PUBLIC_USE_MOCKS=true, the default). It must satisfy the same ApiClient
 * interface as the HTTP implementation — the compiler enforces that.
 */
import type { ApiClient, Team, TeamFilters, RunState, DisputeItem, FreezeSummary } from "@/types";
import { INITIAL_RUN_STATE, MOCK_TEAMS, MOCK_DISPUTES } from "./mockData";

// In-memory mutable state for operations console simulation
let currentRunState: RunState = { ...INITIAL_RUN_STATE };
let teamsStore: Team[] = [...MOCK_TEAMS];
let disputesStore: DisputeItem[] = [...MOCK_DISPUTES];
let freezeRecord: FreezeSummary | null = null;

const SIMULATED_LATENCY_MS = 120;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi: ApiClient = {
  async getRun(): Promise<RunState> {
    await delay(SIMULATED_LATENCY_MS);
    return { ...currentRunState };
  },

  async getTeams(filters?: TeamFilters): Promise<{ teams: Team[]; total: number; filtered: number }> {
    await delay(SIMULATED_LATENCY_MS);
    let result = [...teamsStore];

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.name.toLowerCase().includes(q) ||
          (t.theme && t.theme.toLowerCase().includes(q)) ||
          t.idea.toLowerCase().includes(q)
      );
    }

    if (filters?.status && filters.status !== "ALL") {
      result = result.filter((t) => t.status === filters.status);
    }

    if (filters?.band && filters.band !== "ALL") {
      result = result.filter((t) => t.pass1?.band === filters.band);
    }

    if (filters?.track && filters.track !== "ALL") {
      result = result.filter((t) => t.track === filters.track);
    }

    if (filters?.minScore !== undefined) {
      result = result.filter((t) => (t.pass1?.composite ?? 0) >= filters.minScore!);
    }

    if (filters?.maxScore !== undefined) {
      result = result.filter((t) => (t.pass1?.composite ?? 0) <= filters.maxScore!);
    }

    if (filters?.integrityOnly) {
      result = result.filter((t) => t.integrityFlags && t.integrityFlags.length > 0);
    }

    if (filters?.overriddenOnly) {
      result = result.filter((t) => t.overrideScore !== undefined || t.status === "OVERRIDE");
    }

    const sortBy = filters?.sortBy || "rank";
    const sortOrder = filters?.sortOrder || "asc";

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "rank") {
        const rankA = a.finalRank ?? 9999;
        const rankB = b.finalRank ?? 9999;
        comparison = rankA - rankB;
      } else if (sortBy === "composite") {
        const scoreA = a.pass1?.composite ?? -1;
        const scoreB = b.pass1?.composite ?? -1;
        comparison = scoreB - scoreA;
      } else if (sortBy === "p2Score") {
        const scoreA = a.pass2Score ?? -1;
        const scoreB = b.pass2Score ?? -1;
        comparison = scoreB - scoreA;
      } else if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "id") {
        comparison = a.id.localeCompare(b.id);
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return {
      teams: result,
      total: teamsStore.length,
      filtered: result.length,
    };
  },

  async getTeam(id: string): Promise<Team | null> {
    await delay(SIMULATED_LATENCY_MS);
    const team = teamsStore.find((t) => t.id === id);
    return team ? { ...team } : null;
  },

  async getPass1Stats() {
    await delay(SIMULATED_LATENCY_MS);
    const totalComplete = teamsStore.filter((t) => t.status !== "INCOMPLETE").length;
    const scoredTeams = teamsStore.filter((t) => t.pass1 !== undefined);
    const fastTrackCount = scoredTeams.filter((t) => t.pass1?.band === "FAST_TRACK").length;
    const borderlineCount = scoredTeams.filter((t) => t.pass1?.band === "BORDERLINE").length;
    const rejectCount = scoredTeams.filter((t) => t.pass1?.band === "REJECT").length;

    // Build score distribution buckets (0-10 in 1-point intervals)
    const scoreBuckets = Array.from({ length: 10 }, (_, i) => ({
      range: `${i}-${i + 1}`,
      count: 0,
    }));

    scoredTeams.forEach((t) => {
      const s = Math.min(9, Math.floor(t.pass1?.composite ?? 0));
      if (s >= 0 && s < 10) {
        scoreBuckets[s].count++;
      }
    });

    const composites = scoredTeams.map((t) => t.pass1?.composite ?? 0).sort((a, b) => a - b);
    const mid = Math.floor(composites.length / 2);
    const meanScore = composites.length ? composites.reduce((sum, v) => sum + v, 0) / composites.length : 0;
    const medianScore = !composites.length
      ? 0
      : composites.length % 2
        ? composites[mid]
        : (composites[mid - 1] + composites[mid]) / 2;

    return {
      totalComplete,
      scoredCount: scoredTeams.length,
      remainingCount: totalComplete - scoredTeams.length,
      activeWorkers: currentRunState.activeWorkers,
      idleWorkers: currentRunState.totalWorkers - currentRunState.activeWorkers,
      estimatedCost: currentRunState.p1Cost ?? 0,
      meanScore,
      medianScore,
      bands: {
        reject: rejectCount,
        borderline: borderlineCount,
        fastTrack: fastTrackCount,
      },
      scoreBuckets,
      recentActivity: [
        { id: "KC-0182", time: "1 min ago", status: "scored", score: 8.4, band: "FAST_TRACK" },
        { id: "KC-0147", time: "2 mins ago", status: "scored", score: 7.1, band: "BORDERLINE" },
        { id: "KC-0031", time: "3 mins ago", status: "scored", score: 8.6, band: "FAST_TRACK" },
        { id: "KC-0092", time: "Just now", status: "processing", score: undefined, band: undefined },
        { id: "KC-0028", time: "Just now", status: "processing", score: undefined, band: undefined },
      ],
    };
  },

  async getPass2Stats() {
    await delay(SIMULATED_LATENCY_MS);
    const promotedTotal = currentRunState.p2Promoted ?? 0;
    return {
      promotedTotal,
      completed: currentRunState.p2Completed ?? 0,
      running: currentRunState.p2Running ?? 0,
      queued: currentRunState.p2Queued ?? 0,
      estimatedCost: currentRunState.p2Cost ?? 0,
      streams: {
        themeCritic: { completed: 135, total: promotedTotal, percentage: 94 },
        builderCritic: { completed: 128, total: promotedTotal, percentage: 89 },
        integrityChecker: { completed: 131, total: promotedTotal, percentage: 91 },
        judgeSynthesizer: { completed: 118, total: promotedTotal, percentage: 82 },
      },
    };
  },

  async getDisputes(): Promise<DisputeItem[]> {
    await delay(SIMULATED_LATENCY_MS);
    return [...disputesStore];
  },

  async applyOverride(payload: {
    teamId: string;
    overrideScore: number;
    auditorNote: string;
    auditorId: string;
  }): Promise<{ success: boolean; team: Team }> {
    await delay(200);
    const teamIndex = teamsStore.findIndex((t) => t.id === payload.teamId);
    if (teamIndex === -1) {
      throw new Error(`Team ${payload.teamId} not found`);
    }

    const updatedTeam: Team = {
      ...teamsStore[teamIndex],
      status: "OVERRIDE",
      overrideScore: payload.overrideScore,
      auditorNote: payload.auditorNote,
      auditorId: payload.auditorId,
      updatedAt: new Date().toISOString(),
    };

    teamsStore[teamIndex] = updatedTeam;

    // Update dispute status if exists
    const disputeIndex = disputesStore.findIndex((d) => d.teamId === payload.teamId);
    if (disputeIndex !== -1) {
      disputesStore[disputeIndex] = {
        ...disputesStore[disputeIndex],
        proposedScore: payload.overrideScore,
        status: "RESOLVED",
        auditorId: payload.auditorId,
        auditorNote: payload.auditorNote,
      };
    }

    return { success: true, team: updatedTeam };
  },

  async freezeShortlist(payload: {
    shortlistSize: number;
    auditorId: string;
  }): Promise<{ success: boolean; summary: FreezeSummary }> {
    await delay(300);
    const shortlistTeams = teamsStore.filter((t) => t.status === "SHORTLIST" || (t.finalRank && t.finalRank <= payload.shortlistSize));
    const rejectTeams = teamsStore.filter((t) => t.status === "REJECT" || (t.pass1?.band === "REJECT"));
    const overrideCount = teamsStore.filter((t) => t.status === "OVERRIDE" || t.overrideScore !== undefined).length;

    freezeRecord = {
      frozenAt: new Date().toISOString(),
      frozenBy: payload.auditorId,
      shortlistCount: Math.min(payload.shortlistSize, shortlistTeams.length),
      rejectedCount: rejectTeams.length,
      overridesApplied: overrideCount,
      snapshotId: `snap-${Date.now()}`,
    };

    currentRunState = {
      ...currentRunState,
      status: "FROZEN",
      currentStage: "FROZEN",
      frozenAt: freezeRecord.frozenAt,
      frozenBy: freezeRecord.frozenBy,
    };

    return { success: true, summary: freezeRecord };
  },

  async getFreezeStatus(): Promise<{ isFrozen: boolean; summary: FreezeSummary | null }> {
    await delay(SIMULATED_LATENCY_MS);
    return {
      isFrozen: currentRunState.status === "FROZEN",
      summary: freezeRecord,
    };
  },

  async startIngest(dryRun = false): Promise<{
    dryRun: boolean;
    rowsDetected: number;
    complete: number;
    incomplete: number;
    queuedForP1: number;
    incompleteList: { id: string; name: string; reasons: string[] }[];
  }> {
    await delay(400);
    const incompleteTeams = teamsStore.filter((t) => t.status === "INCOMPLETE");
    return {
      dryRun,
      rowsDetected: teamsStore.length,
      complete: teamsStore.length - incompleteTeams.length,
      incomplete: incompleteTeams.length,
      queuedForP1: teamsStore.length - incompleteTeams.length,
      incompleteList: incompleteTeams.map((t) => ({
        id: t.id,
        name: t.name,
        reasons: t.incompleteReasons || ["Missing required fields"],
      })),
    };
  },

  async restartRun(): Promise<RunState> {
    await delay(200);
    currentRunState = {
      ...INITIAL_RUN_STATE,
      status: "RUNNING",
    };
    freezeRecord = null;
    return { ...currentRunState };
  },
};
