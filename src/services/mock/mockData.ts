import { Team, RunState, DisputeItem, Pass1Band, Track } from "@/types";

function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const adjectives = [
  "Adaptive", "Autonomous", "Cognitive", "Distributed", "Dynamic", "Elastic",
  "Decentralized", "Neural", "Hyper", "Predictive", "Resilient", "Quantum",
  "Synthesized", "Unified", "Vectorized", "Zero-Knowledge", "Self-Healing", "Scalable"
];

const domains = [
  "Supply Chain Optimizer", "Fraud Defense Matrix", "Healthcare Triage Bot",
  "Code Security Synthesizer", "Kubernetes Autopilot", "Clinical Trial Matcher",
  "Disaster Response Rover", "Energy Grid Balancer", "API Spec Synthesizer",
  "Database Query Accelerator", "DeFi Compliance Oracle", "Legal Document Parser",
  "Satellite Imagery Telemetry", "Autonomous Micro-Drone Fleet", "Voice Synthesis Shield",
  "Biomarker Discovery Engine", "Kernel Crash Investigator", "Realtime Fleet Dispatch"
];

export const INITIAL_RUN_STATE: RunState = {
  id: "run-kc4-20260920",
  status: "RUNNING",
  startedAt: "2026-09-20T07:15:00Z",
  elapsedSeconds: 13340, // ~3h 42m
  totalTeams: 250,
  completeTeams: 238,
  incompleteTeams: 12,
  p1Completed: 214,
  p1Queued: 24,
  p2Promoted: 143,
  p2Completed: 96,
  p2Running: 27,
  p2Queued: 20,
  shortlistSize: 50,
  maxShortlistTarget: 50,
  activeWorkers: 42,
  totalWorkers: 50,
  estimatedCost: 12.48,
  p1Cost: 8.42,
  p2Cost: 4.06,
  budgetLimit: 20.00,
  isBudgetKillSwitchTriggered: false,
  currentStage: "PASS_2",
};

function generateTeams(): Team[] {
  const teams: Team[] = [];

  for (let i = 1; i <= 250; i++) {
    const id = `KC-${i.toString().padStart(4, "0")}`;
    const adj = adjectives[(i * 7) % adjectives.length];
    const dom = domains[(i * 11) % domains.length];
    const name = `Team ${adj} ${i}`;
    const track: Track = i % 3 === 0 ? "existing_project" : "new_idea";
    const isComplete = i > 12; // 12 incomplete teams: KC-0001 to KC-0012

    if (!isComplete) {
      const incompleteReasons: string[] = [];
      if (i % 3 === 0) incompleteReasons.push("Missing repository or project demonstration URL");
      if (i % 3 === 1) incompleteReasons.push("Idea description lacks core architecture and scope");
      if (i % 3 === 2) incompleteReasons.push("Incomplete team member roster and contact validation");

      teams.push({
        id,
        name,
        theme: dom,
        idea: `Proposed ${dom} utilizing multi-agent heuristics.`,
        track,
        projectLinks: [],
        memberCount: 1 + (i % 4),
        status: "INCOMPLETE",
        incompleteReasons,
        createdAt: "2026-09-20T06:00:00Z",
        updatedAt: "2026-09-20T06:10:00Z",
      });
      continue;
    }

    // Operational Bands:
    // Teams 13 to 72 (60 teams, ~25%) -> FAST_TRACK
    // Teams 73 to 155 (83 teams, ~35%) -> BORDERLINE
    // Teams 156 to 250 (95 teams, ~40%) -> REJECT
    let band: Pass1Band;
    let baseScore: number;
    let rank: number | undefined;

    if (i <= 72) {
      band = "FAST_TRACK";
      baseScore = 8.0 + (pseudoRandom(i) * 1.7); // 8.0 - 9.7
      rank = i - 12; // Rank 1 to 60
    } else if (i <= 155) {
      band = "BORDERLINE";
      baseScore = 5.8 + (pseudoRandom(i) * 2.0); // 5.8 - 7.8
    } else {
      band = "REJECT";
      baseScore = 2.5 + (pseudoRandom(i) * 3.1); // 2.5 - 5.6
    }

    const clarity = Math.min(10, Math.max(1, +(baseScore + (pseudoRandom(i * 2) * 1.2 - 0.6)).toFixed(1)));
    const originality = Math.min(10, Math.max(1, +(baseScore + (pseudoRandom(i * 3) * 1.4 - 0.7)).toFixed(1)));
    const execution = Math.min(10, Math.max(1, +(baseScore + (pseudoRandom(i * 4) * 1.2 - 0.6)).toFixed(1)));
    const feasibility = Math.min(10, Math.max(1, +(baseScore + (pseudoRandom(i * 5) * 1.0 - 0.5)).toFixed(1)));
    const articulation = Math.min(10, Math.max(1, +(baseScore + (pseudoRandom(i * 6) * 1.2 - 0.6)).toFixed(1)));

    const composite = +(
      0.20 * clarity +
      0.25 * originality +
      0.30 * execution +
      0.10 * feasibility +
      0.15 * articulation
    ).toFixed(2);

    const isP1Done = i <= 226; // 214 completed P1 (out of 238 complete)
    const isPromoted = band !== "REJECT";

    let status: Team["status"] = "P1_QUEUED";
    if (isP1Done) {
      if (band === "REJECT") {
        status = "REJECT";
      } else {
        // Promoted team
        if (i <= 108) {
          // 96 P2 completed
          status = rank && rank <= 50 ? "SHORTLIST" : "P2_DONE";
        } else if (i <= 135) {
          status = "P2_QUEUED";
        } else {
          status = "P1_DONE";
        }
      }
    }

    if (i === 42) {
      status = "OVERRIDE";
    }

    const reasons = {
      problemClarity: clarity >= 8
        ? "Problem formulation is exceptionally crisp with explicit target domain boundaries and operational metrics."
        : clarity >= 6
        ? "Well-scoped problem statement, though boundary conditions under scale remain loosely defined."
        : "Diffuse problem framing; unclear baseline compared to conventional heuristics.",
      originality: originality >= 8
        ? track === "new_idea"
          ? "Novel multi-agent synthesis model with non-standard routing; avoids common off-the-shelf wrappers."
          : "High-leverage architectural refactor introducing novel domain-specific verification hooks."
        : originality >= 6
        ? "Iterative synthesis on existing agentic architectures; incremental but solid value proposition."
        : "Derivative wrapper around generic foundational model prompts without structural novelty.",
      execution: execution >= 8
        ? track === "new_idea"
          ? "Impressive 8-hour sprint milestone: functional end-to-end trace with robust schema validation."
          : "Substantial new core modules integrated cleanly into existing codebase with comprehensive test suites."
        : execution >= 6
        ? "Functional prototype demonstrating key happy-path interactions; error handling remains partial."
        : "Superficial mockups with broken state hooks; core evaluation path failed live execution test.",
      feasibility: feasibility >= 8
        ? "Low operational friction; realistic latency envelopes and reasonable cloud token costs under production loads."
        : feasibility >= 6
        ? "Viable deployment plan; potential rate-limiting bottlenecks during peak streaming ingestion."
        : "Excessive latency and unrealistic API rate requirements make 24h real-time execution questionable.",
      articulation: articulation >= 8
        ? "Exemplary engineering documentation: clear architecture diagrams, API contracts, and reproducible benchmarks."
        : articulation >= 6
        ? "Clean documentation with clear setup guide; some missing explanations in data serialization layer."
        : "Rushed submission with ambiguous README instructions and broken environment configuration keys.",
    };

    const pass2Score = isP1Done && isPromoted && i <= 108
      ? +(composite + (pseudoRandom(i * 9) * 0.6 - 0.2)).toFixed(1)
      : undefined;

    const hasIntegrityFlag = i === 31 || i === 88 || i === 114 || i === 182;
    const integrityFlags: string[] = [];
    if (i === 31) integrityFlags.push("High code similarity (0.84) with public boilerplate repository");
    if (i === 88) integrityFlags.push("Resume reuse detected across two distinct team submissions");
    if (i === 114) integrityFlags.push("Commit timestamps predate hackathon kickoff by 14 days without baseline declaration");
    if (i === 182) integrityFlags.push("Identical problem statement wording to team KC-0042");

    const critique = isPromoted ? {
      themeCritic: {
        crowdingRisk: (i % 5 === 0 ? "HIGH" : i % 3 === 0 ? "MODERATE" : "LOW") as "HIGH" | "MODERATE" | "LOW",
        clusterName: dom,
        differentiationScore: +(7.0 + pseudoRandom(i * 8) * 2.8).toFixed(1),
        notes: [
          `Idea occupies cluster [${dom}] with ${(i % 4) + 1} other promoted candidates.`,
          i % 5 === 0
            ? "Moderate crowding detected with existing submissions; concept needs sharper differentiation."
            : "Clear differentiation in execution model; avoids direct overlap with mainstream approaches.",
          "Domain taxonomy alignment verified against hackathon track priorities."
        ]
      },
      builderCritic: {
        buildSignalScore: +(7.2 + pseudoRandom(i * 7) * 2.6).toFixed(1),
        repoDetected: true,
        commitCountRecent: 14 + (i % 28),
        readmeQuality: (i % 4 === 0 ? "STRONG" : "ACCEPTABLE") as "STRONG" | "ACCEPTABLE" | "MINIMAL",
        notes: [
          "GitHub repository active with continuous commits during the 24-hour evaluation window.",
          "Live test suite executed with passing unit and integration checkpoints.",
          track === "new_idea"
            ? "Greenfield development confirmed; commit lineage starts cleanly at hackathon kickoff."
            : "Differential commit analysis verified net-new functional additions without cosmetic padding."
        ]
      },
      integrityChecker: {
        status: (hasIntegrityFlag ? "FLAGGED" : "CLEAR") as "CLEAR" | "FLAGGED" | "UNDER_REVIEW",
        duplicateIdea: i === 182,
        resumeReuse: i === 88,
        similarTeams: [
          { teamId: `KC-${((i + 17) % 200 + 1).toString().padStart(4, "0")}`, similarity: +(0.45 + pseudoRandom(i) * 0.35).toFixed(2) }
        ],
        notes: hasIntegrityFlag
          ? ["Flagged by automated heuristic inspection. Requires human auditor gate review."]
          : ["No structural plagiarism or anomalous commit cadence detected across code repositories."]
      }
    } : undefined;

    const pass2Verdict = isPromoted && pass2Score ? [
      `Solid engineering rigour with a composite verdict score of ${pass2Score}/10.`,
      `Theme differentiation is validated with ${critique?.themeCritic.crowdingRisk.toLowerCase()} crowding risk in ${dom}.`,
      track === "new_idea"
        ? "Rapid 8-hour execution produced a tangible, testable service."
        : "Meaningful extension beyond legacy baseline with clean decoupling.",
      "Recommended for Shortlist placement subject to human gate audit."
    ] : undefined;

    teams.push({
      id,
      name,
      theme: dom,
      idea: `A high-reliability ${dom.toLowerCase()} designed to optimize operational triage through autonomous multi-agent consensus.`,
      track,
      memberCount: 1 + (i % 4),
      projectLinks: [
        `https://github.com/knowcode4/${id.toLowerCase()}-service`,
        `https://eval.knowcode.dev/demos/${id.toLowerCase()}`
      ],
      status,
      pass1: isP1Done ? {
        problemClarity: clarity,
        originality,
        execution,
        feasibility,
        articulation,
        composite,
        reasons,
        track,
        band,
      } : undefined,
      pass2Score,
      pass2Verdict,
      critique,
      evidenceLinks: [
        { label: "GitHub Repository", url: `https://github.com/knowcode4/${id.toLowerCase()}-service`, type: "github" },
        { label: "Live Demo Endpoint", url: `https://eval.knowcode.dev/demos/${id.toLowerCase()}`, type: "demo" },
        { label: "Technical Spec & README", url: `https://github.com/knowcode4/${id.toLowerCase()}-service#readme`, type: "readme" },
        { label: "Architecture Whitepaper", url: `https://docs.knowcode.dev/teams/${id.toLowerCase()}/spec`, type: "portfolio" },
      ],
      integrityFlags: hasIntegrityFlag ? integrityFlags : undefined,
      finalRank: status === "SHORTLIST" && rank ? rank : undefined,
      overrideScore: i === 42 ? 9.2 : undefined,
      auditorId: i === 42 ? "auditor-jane-doe" : undefined,
      auditorNote: i === 42 ? "Auditor verified commit lineage and exceptional edge case handling in live test trace." : undefined,
      createdAt: "2026-09-20T06:00:00Z",
      updatedAt: "2026-09-20T08:30:00Z",
    });
  }

  return teams;
}

export const MOCK_TEAMS: Team[] = generateTeams();

export const MOCK_DISPUTES: DisputeItem[] = [
  {
    id: "disp-001",
    teamId: "KC-0042",
    teamName: "Team Autonomous 42",
    projectTitle: "DeFi Compliance Oracle",
    currentScore: 8.4,
    proposedScore: 9.2,
    band: "FAST_TRACK",
    reason: "Auditor requested review: Agent trace showed exceptional resiliency during API outage simulation.",
    aiVerdictSummary: "High builder signal (9.2), clean architecture, but scored conservatively on feasibility.",
    status: "RESOLVED",
    auditorId: "auditor-jane-doe",
    auditorNote: "Reviewed trace and awarded 9.2 for scope-adjusted execution resilience.",
    createdAt: "2026-09-20T08:15:00Z",
  },
  {
    id: "disp-002",
    teamId: "KC-0031",
    teamName: "Team Adaptive 31",
    projectTitle: "Code Security Synthesizer",
    currentScore: 8.6,
    band: "FAST_TRACK",
    reason: "Integrity flag: High code similarity (0.84) with public repository. Needs validation of original work.",
    aiVerdictSummary: "Pass-1 composite 8.6, flagged by builder critic for AST-level template matches.",
    status: "PENDING",
    createdAt: "2026-09-20T08:45:00Z",
  },
  {
    id: "disp-003",
    teamId: "KC-0088",
    teamName: "Team Hyper 88",
    projectTitle: "Satellite Imagery Telemetry",
    currentScore: 7.2,
    band: "BORDERLINE",
    reason: "Integrity flag: Resume overlap detected with Team KC-0112.",
    aiVerdictSummary: "Promoted in Borderline band. Candidate submitted identical resume credentials as another team.",
    status: "PENDING",
    createdAt: "2026-09-20T09:00:00Z",
  },
  {
    id: "disp-004",
    teamId: "KC-0114",
    teamName: "Team Neural 114",
    projectTitle: "Autonomous Micro-Drone Fleet",
    currentScore: 7.4,
    band: "BORDERLINE",
    reason: "Timestamp anomaly: Commits detected 14 days before hackathon. Needs baseline diff verification.",
    aiVerdictSummary: "High execution quality, but track was marked new_idea rather than existing_project.",
    status: "PENDING",
    createdAt: "2026-09-20T09:12:00Z",
  },
  {
    id: "disp-005",
    teamId: "KC-0067",
    teamName: "Team Resilient 67",
    projectTitle: "Biomarker Discovery Engine",
    currentScore: 8.1,
    band: "FAST_TRACK",
    reason: "Organizer petition: Evaluation missed newly pushed benchmark test video.",
    aiVerdictSummary: "Evaluated at 8.1. Team provided supplemental artifact showing 10x throughput.",
    status: "PENDING",
    createdAt: "2026-09-20T09:25:00Z",
  },
  {
    id: "disp-006",
    teamId: "KC-0078",
    teamName: "Team Quantum 78",
    projectTitle: "Kernel Crash Investigator",
    currentScore: 7.8,
    band: "BORDERLINE",
    reason: "Borderline cutoff dispute: 0.1 point away from Fast Track promotion.",
    aiVerdictSummary: "Strong execution (8.5), but lower articulation score (6.8).",
    status: "PENDING",
    createdAt: "2026-09-20T09:40:00Z",
  },
  {
    id: "disp-007",
    teamId: "KC-0095",
    teamName: "Team Synthesized 95",
    projectTitle: "Realtime Fleet Dispatch",
    currentScore: 7.6,
    band: "BORDERLINE",
    reason: "Execution check: Core webhook payload failed during initial crawler pass.",
    aiVerdictSummary: "Failed webhook test resulted in penalty on scope-adjusted execution dimension.",
    status: "PENDING",
    createdAt: "2026-09-20T09:50:00Z",
  },
  {
    id: "disp-008",
    teamId: "KC-0103",
    teamName: "Team Scalable 103",
    projectTitle: "API Spec Synthesizer",
    currentScore: 7.5,
    band: "BORDERLINE",
    reason: "Track re-classification request: existing_project vs new_idea evaluation criteria.",
    aiVerdictSummary: "Scored under new_idea rubric with heavy penalty for pre-existing schema definitions.",
    status: "PENDING",
    createdAt: "2026-09-20T10:05:00Z",
  },
  {
    id: "disp-009",
    teamId: "KC-0121",
    teamName: "Team Elastic 121",
    projectTitle: "Healthcare Triage Bot",
    currentScore: 6.9,
    band: "BORDERLINE",
    reason: "HIPAA compliance filter false positive flagged project claims.",
    aiVerdictSummary: "Integrity scanner tripped on mock patient health data in repository.",
    status: "PENDING",
    createdAt: "2026-09-20T10:15:00Z",
  },
  {
    id: "disp-010",
    teamId: "KC-0138",
    teamName: "Team Cognitive 138",
    projectTitle: "Disaster Response Rover",
    currentScore: 7.1,
    band: "BORDERLINE",
    reason: "Hardware simulator dependency prevented full automated Pass-2 test run.",
    aiVerdictSummary: "Builder critic returned minimal signal due to missing simulation environment binary.",
    status: "PENDING",
    createdAt: "2026-09-20T10:22:00Z",
  },
  {
    id: "disp-011",
    teamId: "KC-0149",
    teamName: "Team Dynamic 149",
    projectTitle: "Energy Grid Balancer",
    currentScore: 7.3,
    band: "BORDERLINE",
    reason: "Auditor requested re-score of originality dimension.",
    aiVerdictSummary: "Originality scored at 6.5; team claims novel convex optimization formulation.",
    status: "PENDING",
    createdAt: "2026-09-20T10:30:00Z",
  },
  {
    id: "disp-012",
    teamId: "KC-0182",
    teamName: "Team Unified 182",
    projectTitle: "Legal Document Parser",
    currentScore: 8.4,
    band: "FAST_TRACK",
    reason: "Near-clone warning flagged with team KC-0042 in Legal AI taxonomy.",
    aiVerdictSummary: "High score (8.4), but Theme Critic noted 0.72 similarity in vector embeddings.",
    status: "PENDING",
    createdAt: "2026-09-20T10:35:00Z",
  }
];
