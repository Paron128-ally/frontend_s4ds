"use client";

import React from "react";
import { useTeams } from "@/hooks/useTeams";
import { usePass2Stats } from "@/hooks/useScores";
import { SearchCheck, ArrowUpRight, Clock, Cpu, ShieldAlert, Award, Code, Filter } from "lucide-react";
import Link from "next/link";
import { cn, formatScore } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Pass2Page() {
  const { data: teamsData, isLoading } = useTeams({});
  const teams = teamsData?.teams ?? [];
  const { data: stats, isLoading: statsLoading } = usePass2Stats();

  // Pass-2 eligibility: BORDERLINE + FAST_TRACK only
  const eligible = teams.filter(
    (t) => t.pass1?.band === "FAST_TRACK" || t.pass1?.band === "BORDERLINE"
  );
  const reviewed = eligible.filter((t) => t.pass2Score !== undefined);
  const pending = eligible.filter((t) => t.pass2Score === undefined);

  const avgP2Score =
    reviewed.length > 0
      ? (reviewed.reduce((s, t) => s + (t.pass2Score ?? 0), 0) / reviewed.length).toFixed(1)
      : "—";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-950">Pass-2 Deep Review</h1>
          <p className="text-xs text-brand-500 mt-0.5">Specialist AI agents running multi-dimensional critique on eligible teams</p>
        </div>
        <span className="status-pill badge-green">
          {reviewed.length}/{eligible.length} reviewed
        </span>
      </div>

      {/* Top stats - using backend stats */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 sm:col-span-4 bento-card-green p-6">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-green-200 mb-2">Deep Reviewed</div>
          <div className="text-4xl font-bold text-white">{stats?.completed ?? reviewed.length}</div>
          <div className="text-green-200 text-sm mt-1">of {stats?.promotedTotal ?? eligible.length} promoted</div>
          <div className="mt-4 h-2 rounded-full bg-white/20">
            <div
              className="h-2 rounded-full bg-white"
              style={{
                width: `${(stats?.promotedTotal ?? eligible.length) > 0
                  ? ((stats?.completed ?? reviewed.length) / (stats?.promotedTotal ?? eligible.length)) * 100
                  : 0}%`,
              }}
            />
          </div>
        </div>

        <div className="col-span-6 sm:col-span-4 bento-card p-5">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-brand-400 mb-2">Pending Review</div>
          <div className="text-3xl font-bold text-brand-950">{stats?.queued ?? pending.length}</div>
          <div className="text-xs text-brand-500 mt-0.5">in queue</div>
        </div>

        <div className="col-span-6 sm:col-span-4 bento-card p-5">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-brand-400 mb-2">Running</div>
          <div className="text-3xl font-bold text-brand-950">{stats?.running ?? 0}</div>
          <div className="text-xs text-brand-500 mt-0.5">active workers</div>
        </div>

        <div className="col-span-12 sm:col-span-4 lg:col-span-3 bento-card p-5">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-brand-400 mb-2">Avg P2 Score</div>
          <div className="text-3xl font-bold text-brand-950">{avgP2Score}</div>
          <div className="text-xs text-brand-500 mt-0.5">/ 10 pts</div>
        </div>

        <div className="col-span-12 sm:col-span-4 lg:col-span-3 bento-card p-5">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-brand-400 mb-2">Estimated Cost</div>
          <div className="text-3xl font-bold text-brand-950">${(stats?.estimatedCost ?? 0).toFixed(2)}</div>
          <div className="text-xs text-brand-500 mt-0.5">USD</div>
        </div>

        {/* Specialist stream progress */}
        {stats && (
          <>
            <div className="col-span-12 sm:col-span-6 lg:col-span-3 bento-card p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-purple-400 mb-2">Theme Critic</div>
              <div className="text-3xl font-bold text-brand-950">{stats.streams.themeCritic.percentage}%</div>
              <div className="text-xs text-brand-500 mt-0.5">
                {stats.streams.themeCritic.completed} / {stats.streams.themeCritic.total}
              </div>
              <div className="mt-2 h-2 rounded-full bg-brand-100">
                <div
                  className="h-2 rounded-full bg-purple-500"
                  style={{ width: `${stats.streams.themeCritic.percentage}%` }}
                />
              </div>
            </div>

            <div className="col-span-12 sm:col-span-6 lg:col-span-3 bento-card p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-blue-400 mb-2">Builder Critic</div>
              <div className="text-3xl font-bold text-brand-950">{stats.streams.builderCritic.percentage}%</div>
              <div className="text-xs text-brand-500 mt-0.5">
                {stats.streams.builderCritic.completed} / {stats.streams.builderCritic.total}
              </div>
              <div className="mt-2 h-2 rounded-full bg-brand-100">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: `${stats.streams.builderCritic.percentage}%` }}
                />
              </div>
            </div>

            <div className="col-span-12 sm:col-span-6 lg:col-span-3 bento-card p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-red-400 mb-2">Integrity Checker</div>
              <div className="text-3xl font-bold text-brand-950">{stats.streams.integrityChecker.percentage}%</div>
              <div className="text-xs text-brand-500 mt-0.5">
                {stats.streams.integrityChecker.completed} / {stats.streams.integrityChecker.total}
              </div>
              <div className="mt-2 h-2 rounded-full bg-brand-100">
                <div
                  className="h-2 rounded-full bg-red-500"
                  style={{ width: `${stats.streams.integrityChecker.percentage}%` }}
                />
              </div>
            </div>

            <div className="col-span-12 sm:col-span-6 lg:col-span-3 bento-card p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-amber-400 mb-2">Judge Synthesizer</div>
              <div className="text-3xl font-bold text-brand-950">{stats.streams.judgeSynthesizer.percentage}%</div>
              <div className="text-xs text-brand-500 mt-0.5">
                {stats.streams.judgeSynthesizer.completed} / {stats.streams.judgeSynthesizer.total}
              </div>
              <div className="mt-2 h-2 rounded-full bg-brand-100">
                <div
                  className="h-2 rounded-full bg-amber-500"
                  style={{ width: `${stats.streams.judgeSynthesizer.percentage}%` }}
                />
              </div>
            </div>
          </>
        )}

        {/* Reviewed teams */}
        <div className="col-span-12 lg:col-span-7 bento-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-brand-100">
            <h3 className="text-sm font-semibold text-brand-900">Reviewed Teams</h3>
            <span className="status-pill badge-green text-[10px]">Complete</span>
          </div>
          <div className="overflow-x-auto">
            <table className="ops-table w-full">
              <thead>
                <tr>
                  <th className="text-left">Team</th>
                  <th className="text-left">Track</th>
                  <th className="text-right">P1 Score</th>
                  <th className="text-right">P2 Score</th>
                  <th className="text-left">P1 Band</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-brand-400">
                      Loading...
                    </td>
                  </tr>
                ) : (
                  reviewed.slice(0, 20).map((t) => (
                    <tr key={t.id}>
                      <td>
                        <Link
                          href={`/team/${t.id}`}
                          className="font-semibold text-brand-900 hover:text-brand-700 hover:underline text-xs"
                        >
                          {t.name}
                        </Link>
                      </td>
                      <td>
                        <span className="status-pill badge-blue text-[9px]">{t.track}</span>
                      </td>
                      <td className="text-right text-xs font-mono font-semibold text-brand-700">
                        {t.pass1?.composite?.toFixed(1) ?? "—"}
                      </td>
                      <td className="text-right text-xs font-mono font-bold text-brand-900">
                        {t.pass2Score?.toFixed(1) ?? "—"}
                      </td>
                      <td>
                        <span
                          className={cn(
                            "status-pill text-[9px]",
                            t.pass1?.band === "FAST_TRACK" ? "badge-green" :
                              t.pass1?.band === "BORDERLINE" ? "badge-amber" : "badge-red"
                          )}
                        >
                          {t.pass1?.band}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending queue */}
        <div className="col-span-12 lg:col-span-5 bento-card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-brand-100">
            <Clock className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-brand-900">
              Pending Queue ({pending.length})
            </h3>
          </div>
          <div className="divide-y divide-brand-50 overflow-y-auto max-h-[420px]">
            {pending.slice(0, 15).map((t, i) => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3 hover:bg-brand-50 transition-colors">
                <span className="text-xs text-brand-300 font-mono w-5 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-brand-900 truncate">{t.name}</div>
                  <div className="text-[10px] text-brand-400">
                    {t.track} · P1: {t.pass1?.composite?.toFixed(1) ?? "—"}
                  </div>
                </div>
                <span className="status-pill badge-amber text-[9px]">Queued</span>
              </div>
            ))}
          </div>
        </div>

        {/* Specialist legend */}
        <div className="col-span-12 bento-card p-5">
          <h3 className="text-sm font-semibold text-brand-900 mb-4">Specialist Agents</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: "Theme Critic", desc: "Hackathon theme alignment", color: "bg-brand-100 border-brand-200 text-brand-700" },
              { name: "Builder Critic", desc: "Technical implementation depth", color: "bg-blue-50 border-blue-200 text-blue-700" },
              { name: "Integrity Checker", desc: "Plagiarism & authenticity checks", color: "bg-red-50 border-red-200 text-red-700" },
              { name: "Judge Synthesizer", desc: "Cross-dimension verdict synthesis", color: "bg-purple-50 border-purple-200 text-purple-700" },
            ].map((s) => (
              <div key={s.name} className={cn("rounded-xl border p-3", s.color)}>
                <div className="text-xs font-bold">{s.name}</div>
                <div className="text-[10px] mt-0.5 opacity-70">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
