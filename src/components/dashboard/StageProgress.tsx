"use client";

import React from "react";
import { CheckCircle2, Clock, Play, ArrowRight } from "lucide-react";
import { RunState } from "@/types";

interface StageProgressProps {
  run: RunState;
}

export default function StageProgress({ run }: StageProgressProps) {
  const p1Percent = Math.round((run.p1Completed / run.completeTeams) * 100);
  const p2Percent = Math.round((run.p2Completed / run.p2Promoted) * 100);
  const rankingPercent = run.p2Completed > 0 ? Math.round((run.p2Completed / run.p2Promoted) * 45) : 0;

  const stages = [
    {
      id: "ingest",
      name: "1. Registration Ingest",
      percentage: 100,
      detail: `${run.totalTeams} rows detected • ${run.completeTeams} valid • ${run.incompleteTeams} excluded`,
      status: "COMPLETED",
      statusColor: "text-brand-700 bg-brand-50 border-brand-200",
      barColor: "bg-brand-600",
    },
    {
      id: "pass1",
      name: "2. Pass-1 Cheap Scoring",
      percentage: p1Percent,
      detail: `${run.p1Completed} / ${run.completeTeams} scored (${run.p1Queued} queued) • 5 rubric dimensions`,
      status: p1Percent >= 100 ? "COMPLETED" : "RUNNING",
      statusColor: p1Percent >= 100 
        ? "text-brand-700 bg-brand-50 border-brand-200" 
        : "text-blue-700 bg-blue-50 border-blue-200",
      barColor: p1Percent >= 100 ? "bg-brand-600" : "bg-blue-500",
    },
    {
      id: "pass2",
      name: "3. Pass-2 Deep Review (Promoted Only)",
      percentage: p2Percent,
      detail: `${run.p2Completed} / ${run.p2Promoted} deep reviewed (${run.p2Running} running, ${run.p2Queued} queued)`,
      status: run.p2Completed === run.p2Promoted ? "COMPLETED" : "RUNNING",
      statusColor: "text-indigo-700 bg-indigo-50 border-indigo-200",
      barColor: "bg-indigo-500",
    },
    {
      id: "ranking",
      name: "4. Synthesis & Ranking",
      percentage: rankingPercent,
      detail: `Synthesizing Theme, Builder & Integrity signals → Top ${run.shortlistSize} Shortlist`,
      status: run.status === "FROZEN" ? "COMPLETED" : "IN_PROGRESS",
      statusColor: run.status === "FROZEN" 
        ? "text-purple-700 bg-purple-50 border-purple-200" 
        : "text-amber-700 bg-amber-50 border-amber-200",
      barColor: run.status === "FROZEN" ? "bg-purple-500" : "bg-amber-500",
    },
  ];

  return (
    <div className="bento-card p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-brand-100 pb-3">
        <h3 className="text-xs uppercase tracking-wider text-brand-700 font-semibold">
          Pipeline Staged Funnel Progress
        </h3>
        <span className="text-[11px] text-brand-400">
          Auto-reject: ~40% • Promoted to Pass-2: ~60%
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="rounded-xl border border-brand-100 bg-brand-50/30 p-3.5 space-y-2.5 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-900">{stage.name}</span>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${stage.statusColor}`}
              >
                {stage.status}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-brand-100 h-2.5 rounded-full overflow-hidden flex items-center">
              <div
                className={`h-full rounded-full transition-all duration-500 ${stage.barColor}`}
                style={{ width: `${stage.percentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-brand-500 truncate max-w-[280px]" title={stage.detail}>
                {stage.detail}
              </span>
              <span className="font-bold text-brand-950 shrink-0 ml-2">{stage.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
