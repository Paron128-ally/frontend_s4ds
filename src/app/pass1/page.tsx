"use client";

import React from "react";
import { useTeams } from "@/hooks/useTeams";
import { usePass1Stats } from "@/hooks/useScores";
import BandChart from "@/components/scores/BandChart";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Pass1Page() {
  const { data: teamsData, isLoading } = useTeams({});
  const teams = teamsData?.teams ?? [];
  const { data: stats } = usePass1Stats();

  const totalComplete = stats?.totalComplete ?? 0;
  const scoredCount = stats?.scoredCount ?? 0;
  const remainingCount = stats?.remainingCount ?? 0;
  const fastTrackCount = stats?.bands.fastTrack ?? 0;
  const borderlineCount = stats?.bands.borderline ?? 0;
  const rejectCount = stats?.bands.reject ?? 0;

  const progressPct = totalComplete > 0 ? Math.round((scoredCount / totalComplete) * 100) : 0;

  const scoredTeams = teams.filter(t => t.pass1 !== undefined);
  const recent = scoredTeams.slice(0, 8);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-950">Pass-1 Scoring</h1>
          <p className="text-xs text-brand-500 mt-0.5">Automated rubric scoring across 5 weighted dimensions</p>
        </div>
        <span className="status-pill badge-green">
          {scoredCount}/{totalComplete} scored
        </span>
      </div>

      {/* Bento metrics */}
      <div className="grid grid-cols-12 gap-4">
        {/* Big progress card */}
        <div className="col-span-12 sm:col-span-4 bento-card-green p-6 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-green-200 mb-1">Progress</div>
            <div className="text-4xl font-bold text-white mt-2">{scoredCount}</div>
            <div className="text-green-200 text-sm">of {totalComplete} complete teams scored</div>
            {remainingCount > 0 && (
              <div className="text-[10px] text-green-300 mt-0.5">{remainingCount} remaining</div>
            )}
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-xs text-green-200 mb-1">
              <span>{progressPct}% complete</span>
            </div>
            <div className="h-2 rounded-full bg-white/20">
              <div
                className="h-2 rounded-full bg-white transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Band stats - using API stats */}
        {[
          { label: "FAST TRACK", count: fastTrackCount, pct: scoredCount > 0 ? Math.round((fastTrackCount / scoredCount) * 100) : 0, color: "border-brand-200 bg-brand-50", text: "text-brand-700", pill: "badge-green" },
          { label: "BORDERLINE", count: borderlineCount, pct: scoredCount > 0 ? Math.round((borderlineCount / scoredCount) * 100) : 0, color: "border-amber-200 bg-amber-50", text: "text-amber-700", pill: "badge-amber" },
          { label: "REJECT", count: rejectCount, pct: scoredCount > 0 ? Math.round((rejectCount / scoredCount) * 100) : 0, color: "border-red-200 bg-red-50", text: "text-red-700", pill: "badge-red" },
        ].map((b) => (
          <div key={b.label} className={cn("col-span-12 sm:col-span-4 lg:col-span-2 rounded-2xl border p-4", b.color)}>
            <div className="text-[10px] font-semibold uppercase tracking-widest mb-1 opacity-60" style={{ color: 'inherit' }}>{b.label}</div>
            <div className={cn("text-2xl font-bold", b.text)}>{b.count}</div>
            <div className="text-[11px] opacity-60 mt-0.5">{b.pct}% of scored</div>
          </div>
        ))}

        {/* Mean score */}
        <div className="col-span-12 sm:col-span-4 lg:col-span-2 bento-card p-4 flex flex-col justify-between">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-brand-400 mb-1">Mean Score</div>
          <div className="text-2xl font-bold text-brand-950">{stats ? stats.meanScore.toFixed(1) : "—"}</div>
          <div className="text-xs text-brand-500">/ 10 pts</div>
        </div>

        <div className="col-span-12 sm:col-span-4 lg:col-span-2 bento-card p-4 flex flex-col justify-between">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-brand-400 mb-1">Median Score</div>
          <div className="text-2xl font-bold text-brand-950">{stats ? stats.medianScore.toFixed(1) : "—"}</div>
          <div className="text-xs text-brand-500">P50</div>
        </div>

        {/* Score histogram */}
        <div className="col-span-12 lg:col-span-7 bento-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-brand-900">Score Distribution</h3>
          </div>
          <BandChart bands={stats?.bands} scoreBuckets={stats?.scoreBuckets} />
        </div>

        {/* Recent completions */}
        <div className="col-span-12 lg:col-span-5 bento-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-brand-900">Recent Completions</h3>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600" />
            </span>
          </div>
          <div className="space-y-2">
            {recent.map((t) => (
              <Link key={t.id} href={`/team/${t.id}`} className="flex items-center gap-3 rounded-xl border border-brand-100 bg-brand-50/50 px-3 py-2 hover:bg-brand-50 hover:border-brand-200 transition-all group">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-brand-700 text-[10px] font-bold shrink-0">
                  {t.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-brand-900 truncate">{t.name}</div>
                  <div className="text-[10px] text-brand-400">{t.track}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-brand-800">{t.pass1?.composite?.toFixed(1) ?? "—"}</div>
                  <span className={cn("status-pill text-[9px]",
                    t.pass1?.band === "FAST_TRACK" ? "badge-green" :
                      t.pass1?.band === "BORDERLINE" ? "badge-amber" : "badge-red"
                  )}>{t.pass1?.band}</span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-brand-300 group-hover:text-brand-600 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Rubric reference */}
        <div className="col-span-12 bento-card p-5">
          <h3 className="text-sm font-semibold text-brand-900 mb-4">Scoring Rubric (5 Dimensions)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {[
              { label: "Problem Clarity & Relevance", weight: 20, desc: "How well the problem is defined and addressed" },
              { label: "Idea / Feature Originality", weight: 25, desc: "Novelty and creativity of the concept" },
              { label: "Scope-Adjusted Execution", weight: 30, desc: "Implementation depth relative to scope" },
              { label: "Feasibility Judgment", weight: 10, desc: "Realistic assessment of technical viability" },
              { label: "Articulation", weight: 15, desc: "Clarity of explanation and presentation quality" },
            ].map((d) => (
              <div key={d.label} className="rounded-xl bg-brand-50 border border-brand-100 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-brand-800">{d.label}</span>
                  <span className="text-[10px] font-bold text-brand-600">{d.weight}%</span>
                </div>
                <div className="h-1 rounded-full bg-brand-200 mb-2">
                  <div className="h-1 rounded-full bg-brand-600" style={{ width: `${d.weight}%` }} />
                </div>
                <p className="text-[10px] text-brand-500">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
