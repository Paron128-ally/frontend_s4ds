"use client";

import React from "react";
import { Pass1Score, Track } from "@/types";
import { cn, formatScore } from "@/lib/utils";

interface ScoreBreakdownProps {
  score: Pass1Score;
  showReasons?: boolean;
}

export default function ScoreBreakdown({ score, showReasons = true }: ScoreBreakdownProps) {
  const dimensions = [
    {
      key: "problemClarity" as const,
      label: "Problem Clarity & Relevance",
      weight: "20%",
      score: score.problemClarity,
      color: "bg-blue-500",
      reason: score.reasons?.problemClarity,
    },
    {
      key: "originality" as const,
      label: "Idea / Feature Originality",
      weight: "25%",
      score: score.originality,
      color: "bg-indigo-500",
      reason: score.reasons?.originality,
    },
    {
      key: "execution" as const,
      label: "Scope-Adjusted Execution",
      weight: "30%",
      score: score.execution,
      color: "bg-brand-600",
      reason: score.reasons?.execution,
    },
    {
      key: "feasibility" as const,
      label: "Feasibility Judgment",
      weight: "10%",
      score: score.feasibility,
      color: "bg-teal-500",
      reason: score.reasons?.feasibility,
    },
    {
      key: "articulation" as const,
      label: "Articulation",
      weight: "15%",
      score: score.articulation,
      color: "bg-cyan-500",
      reason: score.reasons?.articulation,
    },
  ];

  const getBandBadge = () => {
    switch (score.band) {
      case "FAST_TRACK":
        return "bg-brand-50 text-brand-800 border-brand-200";
      case "BORDERLINE":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "REJECT":
        return "bg-red-50 text-red-800 border-red-200";
    }
  };

  return (
    <div className="bento-card p-5 space-y-6">
      {/* Top Banner with Composite and Band */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-100 pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-brand-400 font-semibold">
            Authoritative Pass-1 Evaluation
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-brand-950">
              {formatScore(score.composite)}
            </span>
            <span className="text-sm text-brand-400">/ 10.0</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs text-brand-700 font-medium border border-brand-200">
            Track: {score.track === "new_idea" ? "New Idea (8h Sprint)" : "Existing Project"}
          </span>
          <span
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs font-bold tracking-wide",
              getBandBadge()
            )}
          >
            {score.band}
          </span>
        </div>
      </div>

      {/* 5 Authoritative Dimensions */}
      <div className="space-y-4">
        {dimensions.map((dim) => (
          <div key={dim.key} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-brand-900">{dim.label}</span>
                <span className="rounded-full bg-brand-50 px-1.5 py-0.5 text-[10px] text-brand-400 border border-brand-100">
                  Weight: {dim.weight}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-brand-950 text-sm">{formatScore(dim.score)}</span>
                <span className="text-[10px] text-brand-400">/ 10</span>
              </div>
            </div>

            {/* Score Bar */}
            <div className="w-full bg-brand-100 h-2 rounded-full overflow-hidden flex">
              <div
                className={`h-full rounded-full transition-all duration-300 ${dim.color}`}
                style={{ width: `${(dim.score / 10) * 100}%` }}
              />
            </div>

            {/* Dimension Reason */}
            {showReasons && dim.reason && (
              <p className="text-[11px] text-brand-500 pl-1 leading-relaxed border-l-2 border-brand-200 mt-1">
                {dim.reason}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
