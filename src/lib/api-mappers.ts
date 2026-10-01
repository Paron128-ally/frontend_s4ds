import type { Pass1ScoreRow, RunProgressResponse, RunResponse, ShortlistRow, OverrideRequest } from "@/api/generated/model";
import type {
  FreezePayload,
  FreezeStatus,
  OverridePayload,
  Pass1Band,
  Pass1Stats,
  Pass2Stats,
  RunState,
  RunStatus,
  Team,
  TeamFilters,
  TeamStatus,
  TeamsResponse,
  Track,
} from "@/types";

const BANDS: Pass1Band[] = ["REJECT", "BORDERLINE", "FAST_TRACK"];

export function mapRunStatus(status: string): RunStatus {
  switch (status) {
    case "pending":
    case "scoring":
      return "RUNNING";
    case "complete":
      return "COMPLETED";
    case "frozen":
      return "FROZEN";
    case "failed":
      return "FAILED";
    default:
      return "IDLE";
  }
}

export function mapPhase(phase: string, status: RunStatus): RunState["currentStage"] {
  if (status === "FROZEN") return "FROZEN";
  switch (phase) {
    case "pass1":
      return "PASS_1";
    case "pass2":
      return "PASS_2";
    case "review":
      return "HUMAN_GATE";
    default:
      return "INGEST";
  }
}

export function mergeRunAndProgress(run: RunResponse, progress: RunProgressResponse): RunState {
  const status = mapRunStatus(run.status);
  const started = new Date(run.created_at).getTime();
  const ended = run.completed_at ? new Date(run.completed_at).getTime() : Date.now();
  const elapsedSeconds = Number.isFinite(started) ? Math.max(0, Math.round((ended - started) / 1000)) : 0;
  const remaining = Math.max(0, progress.total - progress.scored - progress.failed);

  return {
    id: run.run_id,
    name: run.name ?? undefined,
    status,
    startedAt: run.created_at,
    elapsedSeconds,
    totalTeams: run.total_teams,
    completeTeams: Math.max(0, run.total_teams - run.failed_count),
    incompleteTeams: run.failed_count,
    p1Completed: progress.scored,
    p1Queued: remaining,
    p2Promoted: run.promoted_count ?? 0,
    p2Completed: run.pass2_scored_count ?? 0,
    p2Running: 0,
    p2Queued: Math.max(0, (run.promoted_count ?? 0) - (run.pass2_scored_count ?? 0)),
    shortlistSize: run.promoted_count ?? 0,
    maxShortlistTarget: run.promoted_count ?? 0,
    activeWorkers: 0,
    totalWorkers: 0,
    estimatedCost: 0,
    frozenAt: status === "FROZEN" ? (run.completed_at ?? run.updated_at) : undefined,
    currentStage: mapPhase(run.phase, status),
  };
}

function asBand(value?: string | null): Pass1Band | undefined {
  const band = value?.toUpperCase();
  return BANDS.find((item) => item === band);
}

function asTrack(value?: string | null): Track {
  return value === "existing_project" ? "existing_project" : "new_idea";
}

function reasonText(reasons: Pass1ScoreRow["reasons"], key: string): string {
  const value = reasons?.[key];
  return typeof value === "string" ? value : "";
}

function teamStatus(row: Pass1ScoreRow, shortlist?: ShortlistRow): TeamStatus {
  if (row.error_message) return "INCOMPLETE";
  if (shortlist?.override_band || shortlist?.override_rank != null) return "OVERRIDE";
  if (shortlist?.rank != null) return "SHORTLIST";
  if (shortlist?.judge_score != null) return "P2_DONE";
  if (shortlist) return "P2_QUEUED";
  if (asBand(row.band) === "REJECT") return "REJECT";
  if (row.composite != null) return "P1_DONE";
  return "P1_QUEUED";
}

export function scoresToTeams(rows: Pass1ScoreRow[]): Team[] {
  return rows.map((row) => {
    const band = asBand(row.band);
    const scored = row.composite != null && band;
    const displayName = row.team_name?.trim();
    return {
      id: row.team_id,
      name: displayName || row.team_id,
      idea: row.track_summary?.trim() ?? "",
      track: asTrack(row.track),
      projectLinks: [],
      status: teamStatus(row),
      pass1: scored
        ? {
            problemClarity: row.clarity ?? 0,
            originality: row.originality ?? 0,
            execution: row.execution ?? 0,
            feasibility: row.feasibility ?? 0,
            articulation: row.articulation ?? 0,
            composite: row.composite ?? 0,
            reasons: {
              problemClarity: reasonText(row.reasons, "clarity"),
              originality: reasonText(row.reasons, "originality"),
              execution: reasonText(row.reasons, "execution"),
              feasibility: reasonText(row.reasons, "feasibility"),
              articulation: reasonText(row.reasons, "articulation"),
            },
            track: asTrack(row.track),
            band,
          }
        : undefined,
      incompleteReasons: row.error_message ? [row.error_message] : row.reject_reasons,
      createdAt: "",
      updatedAt: "",
    };
  });
}

export function mergeShortlist(teams: Team[], rows: ShortlistRow[]): Team[] {
  const byId = new Map(rows.map((row) => [row.team_id, row]));
  return teams.map((team) => {
    const row = byId.get(team.id);
    if (!row) return team;
    const band = asBand(row.override_band) ?? team.pass1?.band;
    return {
      ...team,
      status: teamStatus(
        { team_id: team.id, composite: team.pass1?.composite, band: team.pass1?.band, error_message: team.incompleteReasons?.[0] },
        row,
      ),
      finalRank: row.override_rank ?? row.rank ?? undefined,
      pass2Score: row.judge_score ?? undefined,
      pass2Verdict: row.judge_summary ? [row.judge_summary] : undefined,
      auditorNote: row.override_reason ?? undefined,
      pass1: team.pass1 && band ? { ...team.pass1, band } : team.pass1,
    };
  });
}

export function applyTeamFilters(teams: Team[], filters?: TeamFilters): TeamsResponse {
  let next = teams;
  const search = filters?.search?.trim().toLowerCase();
  if (search) {
    next = next.filter((team) =>
      [team.id, team.name, team.idea, team.theme].some((value) => value?.toLowerCase().includes(search)),
    );
  }
  if (filters?.status && filters.status !== "ALL") next = next.filter((team) => team.status === filters.status);
  if (filters?.band && filters.band !== "ALL") next = next.filter((team) => team.pass1?.band === filters.band);
  if (filters?.track && filters.track !== "ALL") next = next.filter((team) => team.track === filters.track);
  if (filters?.minScore != null) next = next.filter((team) => (team.pass1?.composite ?? -1) >= filters.minScore!);
  if (filters?.maxScore != null) next = next.filter((team) => (team.pass1?.composite ?? 11) <= filters.maxScore!);
  if (filters?.integrityOnly) next = next.filter((team) => (team.integrityFlags?.length ?? 0) > 0);
  if (filters?.overriddenOnly) next = next.filter((team) => team.status === "OVERRIDE" || team.auditorNote);

  const sortBy = filters?.sortBy ?? "id";
  const direction = filters?.sortOrder === "desc" ? -1 : 1;
  next = [...next].sort((a, b) => {
    const value = (team: Team) => {
      switch (sortBy) {
        case "rank":
          return team.finalRank ?? Number.MAX_SAFE_INTEGER;
        case "composite":
          return team.pass1?.composite ?? -1;
        case "p2Score":
          return team.pass2Score ?? -1;
        case "final":
          return team.pass2Score ?? team.pass1?.composite ?? -1;
        case "name":
          return team.name;
        default:
          return team.id;
      }
    };
    const left = value(a);
    const right = value(b);
    if (left < right) return -1 * direction;
    if (left > right) return 1 * direction;
    return 0;
  });

  return { teams: next, total: teams.length, filtered: next.length };
}

export function derivePass1Stats(teams: Team[], progress?: RunProgressResponse): Pass1Stats {
  const scored = teams.filter((team) => team.pass1);
  const composites = scored.map((team) => team.pass1!.composite).sort((a, b) => a - b);
  const mean = composites.length ? composites.reduce((sum, score) => sum + score, 0) / composites.length : 0;
  const mid = Math.floor(composites.length / 2);
  const median = composites.length === 0 ? 0 : composites.length % 2 ? composites[mid] : (composites[mid - 1] + composites[mid]) / 2;
  const buckets = Array.from({ length: 10 }, (_, index) => ({ range: `${index}-${index + 1}`, count: 0 }));
  for (const score of composites) {
    buckets[Math.min(9, Math.floor(score))].count += 1;
  }

  return {
    totalComplete: progress?.total ?? teams.length,
    scoredCount: progress?.scored ?? scored.length,
    remainingCount: progress ? Math.max(0, progress.total - progress.scored) : teams.length - scored.length,
    activeWorkers: 0,
    idleWorkers: 0,
    estimatedCost: 0,
    meanScore: mean,
    medianScore: median,
    bands: {
      reject: scored.filter((team) => team.pass1?.band === "REJECT").length,
      borderline: scored.filter((team) => team.pass1?.band === "BORDERLINE").length,
      fastTrack: scored.filter((team) => team.pass1?.band === "FAST_TRACK").length,
    },
    scoreBuckets: buckets,
    recentActivity: scored.slice(-8).reverse().map((team) => ({
      id: team.id,
      time: "—",
      status: "scored" as const,
      score: team.pass1?.composite,
      band: team.pass1?.band,
    })),
  };
}

export function derivePass2Stats(run: RunState): Pass2Stats {
  const empty = { completed: 0, total: run.p2Promoted ?? 0, percentage: 0 };
  return {
    promotedTotal: run.p2Promoted ?? 0,
    completed: run.p2Completed ?? 0,
    running: run.p2Running ?? 0,
    queued: run.p2Queued ?? 0,
    estimatedCost: 0,
    streams: {
      themeCritic: empty,
      builderCritic: empty,
      integrityChecker: empty,
      judgeSynthesizer: empty,
    },
  };
}

export function toFreezeStatus(run: RunState, teams: Team[]): FreezeStatus {
  const shortlist = teams.filter((team) => team.finalRank != null);
  const overrides = teams.filter((team) => team.status === "OVERRIDE" || team.auditorNote);
  return {
    isFrozen: run.status === "FROZEN",
    summary: run.status === "FROZEN"
      ? {
          frozenAt: run.frozenAt ?? run.startedAt,
          frozenBy: run.frozenBy ?? "reviewer",
          shortlistCount: shortlist.length,
          rejectedCount: teams.filter((team) => team.pass1?.band === "REJECT").length,
          overridesApplied: overrides.length,
          snapshotId: run.id,
        }
      : undefined,
  };
}

export function toOverrideBody(payload: OverridePayload): OverrideRequest {
  const band = payload.overrideScore < 4 ? "REJECT" : payload.overrideScore < 7 ? "BORDERLINE" : "FAST_TRACK";
  return {
    team_id: payload.teamId,
    override_band: band,
    reason: payload.auditorNote,
    reviewer_name: payload.auditorId,
  };
}

/** Freeze has no request body. The UI payload is kept for the form and ignored here. */
export function toFreezeBody(_payload: FreezePayload): Record<string, never> {
  return {};
}
