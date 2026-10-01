"use client";

import React from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { useRunHref } from "@/hooks/useRunHref";
import { usePass1Stats } from "@/hooks/useScores";
import { useTeams } from "@/hooks/useTeams";
import BandChart from "@/components/scores/BandChart";
import TrackSummaryCell from "@/components/teams/TrackSummaryCell";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { downloadPass1ScoresCsv, pass1CsvRow, PASS1_CSV_COLUMNS } from "@/lib/team-scores-csv";
import { cn, formatScore } from "@/lib/utils";
import type { Team } from "@/types";

const SCORE_COLUMNS = PASS1_CSV_COLUMNS;

function ScorePoint({ score, reason }: { score?: number; reason?: string }) {
  const [hover, setHover] = React.useState(false);
  const [pinned, setPinned] = React.useState(false);
  const text = reason?.trim();
  const value = formatScore(score);
  if (!text) return <span className="font-mono text-xs">{value}</span>;
  return (
    <Tooltip open={hover || pinned} onOpenChange={setHover}>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-expanded={hover || pinned}
          onClick={() => setPinned((current) => !current)}
          className="font-mono text-xs underline decoration-dotted decoration-brand-300 underline-offset-2 hover:text-brand-800"
        >
          {value}
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-sm bg-brand-950 px-3 py-2 text-left text-xs leading-relaxed text-white">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

function scoreRow(team: Team) {
  return pass1CsvRow(team);
}

export default function Pass1Page() {
  const teamBase = useRunHref("team");
  const { data: stats } = usePass1Stats();
  const { data: teamsData, isLoading } = useTeams({ sortBy: "composite", sortOrder: "desc" });
  const teams = teamsData?.teams ?? [];

  const totalComplete = stats?.totalComplete ?? 0;
  const scoredCount = stats?.scoredCount ?? 0;
  const remainingCount = stats?.remainingCount ?? 0;
  const fastTrackCount = stats?.bands.fastTrack ?? 0;
  const borderlineCount = stats?.bands.borderline ?? 0;
  const rejectCount = stats?.bands.reject ?? 0;

  const progressPct = totalComplete > 0 ? Math.round((scoredCount / totalComplete) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-950">Round 1 Scoring</h1>
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

        {/* Score histogram */}
        <div className="col-span-12 bento-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-brand-900">Score Distribution</h3>
          </div>
          <BandChart bands={stats?.bands} scoreBuckets={stats?.scoreBuckets} />
        </div>

        <div className="col-span-12 bento-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 p-5">
            <h3 className="text-sm font-semibold text-brand-900">All team scores</h3>
            <button
              type="button"
              onClick={() => downloadPass1ScoresCsv(teams)}
              disabled={teams.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-800 hover:bg-brand-50 disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              Download CSV
            </button>
          </div>
          {isLoading && <p className="px-5 pb-5 text-sm text-brand-500">Loading scores...</p>}
          {!isLoading && teams.length === 0 && <p className="px-5 pb-5 text-sm text-brand-500">No Round 1 scores yet.</p>}
          {teams.length > 0 && (
            <TooltipProvider delayDuration={150}>
            <div className="overflow-x-auto">
              <table className="ops-table w-full">
                <thead>
                  <tr>
                    {SCORE_COLUMNS.map(([, label]) => (
                      <th key={label} className="text-left">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => {
                    const row = scoreRow(team);
                    return (
                      <tr key={team.id}>
                        <td className="font-mono text-[11px] text-brand-500">
                          <Link href={`${teamBase}/${encodeURIComponent(team.id)}`} className="hover:underline">{row.team_id}</Link>
                        </td>
                        <td className="font-semibold text-brand-900">
                          {team.name !== team.id ? team.name : "—"}
                        </td>
                        <td>
                          <TrackSummaryCell track={team.track} summary={team.idea} />
                        </td>
                        <td><ScorePoint score={team.pass1?.problemClarity} reason={team.pass1?.reasons.problemClarity} /></td>
                        <td><ScorePoint score={team.pass1?.originality} reason={team.pass1?.reasons.originality} /></td>
                        <td><ScorePoint score={team.pass1?.execution} reason={team.pass1?.reasons.execution} /></td>
                        <td><ScorePoint score={team.pass1?.feasibility} reason={team.pass1?.reasons.feasibility} /></td>
                        <td><ScorePoint score={team.pass1?.articulation} reason={team.pass1?.reasons.articulation} /></td>
                        <td className="font-mono text-xs font-semibold">{formatScore(team.pass1?.composite)}</td>
                        <td className="text-xs">{row.band.replaceAll("_", " ") || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            </TooltipProvider>
          )}
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
