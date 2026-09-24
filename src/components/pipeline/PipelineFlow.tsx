"use client";

import React, { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  NodeProps,
  Edge,
  Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { 
  Database, 
  CheckCircle2, 
  Filter, 
  Layers, 
  Code, 
  ShieldAlert, 
  Award, 
  Lock, 
  GitFork,
  Cpu,
  Clock,
  XCircle,
  FileSpreadsheet
} from "lucide-react";
import { RunState } from "@/types";
import { PASS2_ENABLED, TELEMETRY_MODE } from "@/config/demo";

interface CustomNodeData extends Record<string, unknown> {
  title: string;
  subtitle?: string;
  status: "idle" | "running" | "completed" | "warning" | "error";
  jobs: string;
  workers?: number;
  runtime?: string;
  stageBadge?: string;
  isReject?: boolean;
  isFinal?: boolean;
}

// Custom Node Renderer
function PipelineStageNode({ data }: NodeProps<Node<CustomNodeData>>) {
  const getStatusBadge = () => {
    switch (data.status) {
      case "completed":
        return "bg-emerald-950/80 text-emerald-300 border-emerald-700/80";
      case "running":
        return "bg-blue-950/80 text-blue-300 border-blue-700/80 animate-pulse";
      case "warning":
        return "bg-amber-950/80 text-amber-300 border-amber-700/80";
      case "error":
        return "bg-red-950/80 text-red-300 border-red-700/80";
      case "idle":
      default:
        return "bg-gray-50 text-gray-500 border-gray-300";
    }
  };

  const getBorderColor = () => {
    if (data.isReject) return "border-red-900/60 bg-red-950/15";
    if (data.isFinal) return "border-purple-800/80 bg-purple-950/20";
    if (data.status === "running") return "border-blue-500/80 bg-white/90 shadow-blue-500/10 shadow-lg";
    if (data.status === "completed") return "border-emerald-800/60 bg-white/80";
    return "border-gray-200 bg-white/70";
  };

  return (
    <div
      className={`w-64 rounded-lg border p-3 font-mono shadow-md transition-all ${getBorderColor()}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-500 !w-2 !h-2" />

      <div className="flex items-center justify-between border-b border-gray-200/80 pb-2 mb-2">
        <div className="font-bold text-xs text-gray-950 truncate max-w-[140px]" title={data.title}>
          {data.title}
        </div>
        <span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold ${getStatusBadge()}`}>
          {data.status.toUpperCase()}
        </span>
      </div>

      <div className="space-y-1.5 text-[10px]">
        <div className="flex items-center justify-between text-gray-700">
          <span className="text-gray-400">Processed:</span>
          <span className="font-bold text-gray-900">{data.jobs}</span>
        </div>

        {data.workers !== undefined && (
          <div className="flex items-center justify-between text-gray-700">
            <span className="text-gray-400 flex items-center gap-1">
              <Cpu className="h-2.5 w-2.5 text-blue-400" />
              Workers:
            </span>
            <span className="text-blue-300 font-bold">{data.workers} threads</span>
          </div>
        )}

        {data.runtime && (
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-gray-400 flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              Runtime:
            </span>
            <span>{data.runtime}</span>
          </div>
        )}

        {data.subtitle && (
          <div className="text-[9px] text-gray-500 truncate pt-1 border-t border-gray-200/60">
            {data.subtitle}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-blue-500 !w-2 !h-2" />
    </div>
  );
}

const nodeTypes = {
  stageNode: PipelineStageNode,
};

interface PipelineFlowProps {
  run: RunState;
  pass1Stats?: {
    scoredCount: number;
    totalComplete: number;
    bands?: { reject: number };
    activeWorkers?: number;
    idleWorkers?: number;
  };
  pass2Stats?: {
    promotedTotal: number;
    completed: number;
    running: number;
    queued: number;
    streams: {
      themeCritic: { completed: number; total: number };
      builderCritic: { completed: number; total: number };
      integrityChecker: { completed: number; total: number };
      judgeSynthesizer: { completed: number; total: number };
    };
  };
}

export default function PipelineFlow({ run, pass1Stats, pass2Stats }: PipelineFlowProps) {
  const isFrozen = run.status === "FROZEN";
  const p2Promoted = run.p2Promoted ?? 0;
  const totalTeams = run.totalTeams ?? 0;
  const completeTeams = run.completeTeams ?? 0;
  const incompleteTeams = run.incompleteTeams ?? 0;
  const p1Completed = run.p1Completed ?? 0;
  const p1Queued = run.p1Queued ?? 0;
  const p2Completed = run.p2Completed ?? 0;
  const p2Running = run.p2Running ?? 0;
  const p2Queued = run.p2Queued ?? 0;

  // Calculate reject count properly - never negative
  const rejectCount = pass1Stats?.bands?.reject;

  const nodes: Node<CustomNodeData>[] = useMemo(
    () => [
      {
        id: "sheets",
        type: "stageNode",
        position: { x: 380, y: 0 },
        data: {
          title: "Registration Source",
          subtitle: "API-provided registration data",
          status: "completed",
          jobs: `${totalTeams} rows detected`,
          runtime: "Live Sync",
        },
      },
      {
        id: "ingestor",
        type: "stageNode",
        position: { x: 380, y: 110 },
        data: {
          title: "Registration Ingestor",
          subtitle: "Schema normalization & sanitization",
          status: "completed",
          jobs: `${completeTeams} / ${totalTeams} parsed`,
        },
      },
      {
        id: "completeness",
        type: "stageNode",
        position: { x: 380, y: 220 },
        data: {
          title: "Completeness Check",
          subtitle: "Excludes missing ideas & links",
          status: "completed",
          jobs: `${completeTeams} valid · ${incompleteTeams} excluded`,
        },
      },
      {
        id: "pass1",
        type: "stageNode",
        position: { x: 380, y: 340 },
        data: {
          title: "Pass-1 Cheap Scorer",
          subtitle: "5-dimension weighted rubric",
          status: p1Completed >= completeTeams && p1Queued === 0 ? "completed" : "running",
          jobs: pass1Stats ? `${pass1Stats.scoredCount} / ${pass1Stats.totalComplete} scored` : `${p1Completed} / ${completeTeams} scored`,
          workers: TELEMETRY_MODE === "static" ? pass1Stats?.activeWorkers ?? run.activeWorkers : undefined,
          runtime: pass1Stats ? (pass1Stats.scoredCount >= pass1Stats.totalComplete ? "Complete" : undefined) : undefined,
        },
      },
      {
        id: "reject",
        type: "stageNode",
        position: { x: 120, y: 480 },
        data: {
          title: "REJECT",
          subtitle: "Bottom tier terminates at Pass-1",
          status: "completed",
          jobs: rejectCount === undefined ? "—" : `${rejectCount} teams rejected`,
          isReject: true,
        },
      },
      {
        id: "promoted",
        type: "stageNode",
        position: { x: 580, y: 480 },
        data: {
          title: "Pass-2",
          subtitle: "Pass-2 candidate pool",
          status: PASS2_ENABLED ? "completed" : "idle",
          jobs: PASS2_ENABLED && pass2Stats ? `${pass2Stats.promotedTotal} teams promoted` : "Not started",
        },
      },
      // 3 Specialist Streams
      {
        id: "theme",
        type: "stageNode",
        position: { x: 320, y: 620 },
        data: {
          title: "Theme Critic",
          subtitle: "Crowding risk & differentiation",
          status: p2Running > 0 || p2Completed > 0 ? "running" : "idle",
          jobs: pass2Stats ? `${pass2Stats.streams.themeCritic.completed} / ${pass2Stats.streams.themeCritic.total} reviewed` : p2Promoted > 0 ? `${p2Promoted} eligible` : "—",
          workers: pass2Stats ? undefined : p2Running || undefined,
        },
      },
      {
        id: "builder",
        type: "stageNode",
        position: { x: 580, y: 620 },
        data: {
          title: "Builder Critic",
          subtitle: "Git commits & implementation",
          status: p2Running > 0 || p2Completed > 0 ? "running" : "idle",
          jobs: pass2Stats ? `${pass2Stats.streams.builderCritic.completed} / ${pass2Stats.streams.builderCritic.total} reviewed` : p2Promoted > 0 ? `${p2Promoted} eligible` : "—",
          workers: pass2Stats ? undefined : p2Running || undefined,
        },
      },
      {
        id: "integrity",
        type: "stageNode",
        position: { x: 840, y: 620 },
        data: {
          title: "Integrity Checker",
          subtitle: "Plagiarism, clones, resume reuse",
          status: p2Running > 0 || p2Completed > 0 ? "running" : "idle",
          jobs: pass2Stats ? `${pass2Stats.streams.integrityChecker.completed} / ${pass2Stats.streams.integrityChecker.total} reviewed` : p2Promoted > 0 ? `${p2Promoted} eligible` : "—",
          workers: pass2Stats ? undefined : p2Running || undefined,
        },
      },
      {
        id: "synthesizer",
        type: "stageNode",
        position: { x: 580, y: 760 },
        data: {
          title: "Judge Synthesizer",
          subtitle: "Multi-agent consensus verdict",
          status: p2Running > 0 ? "running" : p2Completed > 0 ? "completed" : "idle",
          jobs: pass2Stats ? `${pass2Stats.streams.judgeSynthesizer.completed} / ${pass2Stats.streams.judgeSynthesizer.total} synthesized` : p2Running > 0 ? `${p2Running} running, ${p2Completed} completed` : p2Completed > 0 ? `${p2Completed} completed` : "—",
          workers: pass2Stats ? undefined : p2Running || undefined,
        },
      },
      {
        id: "ranker",
        type: "stageNode",
        position: { x: 580, y: 880 },
        data: {
          title: "Shortlist Ranker",
          subtitle: "Deterministic sorting",
          status: p2Completed > 0 ? "running" : "idle",
          jobs: run.shortlistSize ? `Top ${run.shortlistSize} target` : "—",
        },
      },
      {
        id: "humanGate",
        type: "stageNode",
        position: { x: 580, y: 1000 },
        data: {
          title: "Human Gate & Disputes",
          subtitle: "Auditor review & overrides",
          status: "warning",
          jobs: "Auditor queue",
        },
      },
      {
        id: "freeze",
        type: "stageNode",
        position: { x: 580, y: 1120 },
        data: {
          title: "Shortlist Freeze",
          subtitle: "Permanent immutable snapshot",
          status: isFrozen ? "completed" : "idle",
          jobs: isFrozen ? `Shortlist frozen` : "Awaiting freeze",
        },
      },
    ],
    [
      run,
      isFrozen,
      pass1Stats,
      pass2Stats,
      totalTeams,
      completeTeams,
      incompleteTeams,
      p1Completed,
      p1Queued,
      p2Promoted,
      p2Completed,
      p2Running,
      rejectCount,
    ]
  );

  const edges: Edge[] = useMemo(
    () => [
      { id: "e1-2", source: "sheets", target: "ingestor", animated: true, style: { stroke: "#3b82f6" } },
      { id: "e2-3", source: "ingestor", target: "completeness", animated: true, style: { stroke: "#3b82f6" } },
      { id: "e3-4", source: "completeness", target: "pass1", animated: true, style: { stroke: "#3b82f6" } },
      { id: "e4-reject", source: "pass1", target: "reject", style: { stroke: "#ef4444", strokeDasharray: "4 4" } },
      { id: "e4-promoted", source: "pass1", target: "promoted", animated: true, style: { stroke: "#10b981" } },
      { id: "e-prom-theme", source: "promoted", target: "theme", animated: true, style: { stroke: "#8b5cf6" } },
      { id: "e-prom-builder", source: "promoted", target: "builder", animated: true, style: { stroke: "#3b82f6" } },
      { id: "e-prom-integrity", source: "promoted", target: "integrity", animated: true, style: { stroke: "#10b981" } },
      { id: "e-theme-synth", source: "theme", target: "synthesizer", style: { stroke: "#8b5cf6" } },
      { id: "e-builder-synth", source: "builder", target: "synthesizer", style: { stroke: "#3b82f6" } },
      { id: "e-integrity-synth", source: "integrity", target: "synthesizer", style: { stroke: "#10b981" } },
      { id: "e-synth-rank", source: "synthesizer", target: "ranker", animated: true, style: { stroke: "#f59e0b" } },
      { id: "e-rank-human", source: "ranker", target: "humanGate", style: { stroke: "#f59e0b" } },
      { id: "e-human-freeze", source: "humanGate", target: "freeze", animated: isFrozen, style: { stroke: isFrozen ? "#a855f7" : "#475569" } },
    ],
    [isFrozen]
  );

  const displayNodes = PASS2_ENABLED ? nodes : nodes.filter((node) => !["theme", "builder", "integrity", "synthesizer", "ranker"].includes(node.id));
  const displayEdges = PASS2_ENABLED ? edges : edges.filter((edge) => !["theme", "builder", "integrity", "synthesizer", "ranker"].includes(String(edge.source)) && !["theme", "builder", "integrity", "synthesizer", "ranker"].includes(String(edge.target)));

  return (
    <div className="h-[750px] w-full rounded-lg border border-gray-200 bg-white overflow-hidden relative shadow-inner">
      <div className="absolute top-3 left-3 z-10 rounded-md border border-gray-200 bg-white/90 p-2.5 text-[11px] font-mono backdrop-blur">
        <span className="text-gray-500 block font-semibold mb-1">INTERACTIVE DAG PIPELINE</span>
        <div className="flex items-center gap-3 text-gray-700">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Complete
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" /> Running
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-400" /> Attention
          </span>
        </div>
      </div>

      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.3}
        maxZoom={1.5}
      >
        <Background color="#1e293b" gap={20} size={1} />
        <Controls className="!bg-white !border-gray-200 !text-gray-800" />
      </ReactFlow>
    </div>
  );
}
