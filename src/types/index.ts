export type TeamStatus =
  | "INCOMPLETE"
  | "P1_QUEUED"
  | "P1_DONE"
  | "REJECT"
  | "P2_QUEUED"
  | "P2_DONE"
  | "SHORTLIST"
  | "OVERRIDE";

export type Pass1Band =
  | "REJECT"
  | "BORDERLINE"
  | "FAST_TRACK";

export type Track =
  | "new_idea"
  | "existing_project";

export interface Pass1Score {
  problemClarity: number; // 20%
  originality: number;    // 25%
  execution: number;      // 30%
  feasibility: number;    // 10%
  articulation: number;   // 15%
  composite: number;
  reasons: {
    problemClarity: string;
    originality: string;
    execution: string;
    feasibility: string;
    articulation: string;
  };
  track: Track;
  band: Pass1Band;
}

export interface SpecialistCritique {
  themeCritic: {
    crowdingRisk: "LOW" | "MODERATE" | "HIGH";
    clusterName: string;
    differentiationScore: number;
    notes: string[];
  };
  builderCritic: {
    buildSignalScore: number; // 0-10
    repoDetected: boolean;
    commitCountRecent: number;
    readmeQuality: "STRONG" | "ACCEPTABLE" | "MINIMAL";
    notes: string[];
  };
  integrityChecker: {
    status: "CLEAR" | "FLAGGED" | "UNDER_REVIEW";
    duplicateIdea: boolean;
    resumeReuse: boolean;
    similarTeams: { teamId: string; similarity: number }[];
    notes: string[];
  };
}

export interface EvidenceLink {
  label: string;
  url: string;
  type: "github" | "portfolio" | "readme" | "demo" | "other";
}

export interface Team {
  id: string;
  name: string;
  theme?: string;
  idea: string;
  track: Track;
  projectLinks: string[];
  memberCount?: number;
  status: TeamStatus;
  pass1?: Pass1Score;
  pass2Score?: number;
  pass2Verdict?: string[];
  critique?: SpecialistCritique;
  evidenceLinks?: EvidenceLink[];
  integrityFlags?: string[];
  finalRank?: number;
  overrideScore?: number;
  auditorId?: string;
  auditorNote?: string;
  incompleteReasons?: string[];
  createdAt: string;
  updatedAt: string;
}

export type RunStatus = "IDLE" | "RUNNING" | "PAUSED" | "COMPLETED" | "FAILED" | "FROZEN";

export type UserRole = "ops" | "auditor" | "admin";

export interface RunState {
  id: string;
  status: RunStatus;
  startedAt: string;
  elapsedSeconds: number;
  totalTeams: number;
  completeTeams: number;
  incompleteTeams: number;
  p1Completed: number;
  p1Queued: number;
  p2Promoted: number;
  p2Completed: number;
  p2Running: number;
  p2Queued: number;
  shortlistSize: number;
  maxShortlistTarget: number;
  activeWorkers: number;
  totalWorkers: number;
  estimatedCost: number;
  p1Cost: number;
  p2Cost: number;
  budgetLimit: number;
  isBudgetKillSwitchTriggered: boolean;
  frozenAt?: string;
  frozenBy?: string;
  currentStage: "INGEST" | "PASS_1" | "PASS_2" | "SYNTHESIS" | "RANKING" | "HUMAN_GATE" | "FROZEN";
}

export interface DisputeItem {
  id: string;
  teamId: string;
  teamName: string;
  projectTitle: string;
  currentScore: number;
  proposedScore?: number;
  band: Pass1Band;
  reason: string;
  aiVerdictSummary: string;
  auditorId?: string;
  auditorNote?: string;
  status: "PENDING" | "RESOLVED" | "DISMISSED";
  createdAt: string;
}

export interface PipelineNodeData {
  id: string;
  label: string;
  stageType: string;
  status: "idle" | "running" | "completed" | "warning" | "error";
  totalJobs: number;
  completedJobs: number;
  errorCount: number;
  runtime?: string;
  activeWorkers?: number;
  detail?: string;
}

export interface FreezeSummary {
  frozenAt: string;
  frozenBy: string;
  shortlistCount: number;
  rejectedCount: number;
  overridesApplied: number;
  snapshotId: string;
}

export * from "./api";
