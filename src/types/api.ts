/**
 * UI-facing request and response shapes used by pages and hooks.
 * Wire types for the FastAPI backend come from Orval (`src/api/generated`).
 */
import type { FreezeSummary, Pass1Band, Team } from "./index";

// ---------- GET /teams -------------------------------------------------------

export interface TeamFilters {
  search?: string;
  status?: string; // "ALL" (or omitted) = no filter
  band?: string; // "ALL" (or omitted) = no filter
  track?: string; // "ALL" (or omitted) = no filter
  minScore?: number;
  maxScore?: number;
  integrityOnly?: boolean;
  overriddenOnly?: boolean;
  sortBy?: "rank" | "composite" | "p2Score" | "final" | "name" | "id";
  sortOrder?: "asc" | "desc";
}

export interface TeamsResponse {
  teams: Team[];
  /** All teams in the run, ignoring filters. */
  total: number;
  /** Teams matching the filters (= teams.length unless paginated). */
  filtered: number;
}

// ---------- Stats -------------------------------------------------------------

export interface Pass1Stats {
  totalComplete: number;
  scoredCount: number;
  remainingCount: number;
  activeWorkers: number;
  idleWorkers: number;
  estimatedCost: number;
  /** Mean / median of the Pass-1 composite score (0–10) over scored teams. */
  meanScore: number;
  medianScore: number;
  bands: { reject: number; borderline: number; fastTrack: number };
  /** Ten 1-point buckets: "0-1" … "9-10". */
  scoreBuckets: { range: string; count: number }[];
  recentActivity: {
    id: string;
    time: string;
    status: "scored" | "processing";
    score?: number;
    band?: Pass1Band;
  }[];
}

export interface Pass2StreamProgress {
  completed: number;
  total: number;
  percentage: number;
}

export interface Pass2Stats {
  promotedTotal: number;
  completed: number;
  running: number;
  queued: number;
  estimatedCost: number;
  streams: {
    themeCritic: Pass2StreamProgress;
    builderCritic: Pass2StreamProgress;
    integrityChecker: Pass2StreamProgress;
    judgeSynthesizer: Pass2StreamProgress;
  };
}

// ---------- Mutations ---------------------------------------------------------

export interface OverridePayload {
  teamId: string;
  overrideScore: number; // 0–10
  auditorNote: string; // min 15 chars
  auditorId: string;
}

export interface OverrideResponse {
  success: boolean;
  team: Team;
}

export interface FreezePayload {
  shortlistSize: number;
  auditorId: string;
}

export interface FreezeResponse {
  success: boolean;
  summary: FreezeSummary;
}

export interface FreezeStatus {
  isFrozen: boolean;
  /** Present once frozen. Absent (or null) before that. */
  summary?: FreezeSummary | null;
}

export interface IngestResult {
  dryRun: boolean;
  rowsDetected: number;
  complete: number;
  incomplete: number;
  queuedForP1: number;
  incompleteList: { id: string; name: string; reasons: string[] }[];
}

