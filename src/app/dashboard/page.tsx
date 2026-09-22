"use client";

import React from "react";
import {
  Users, CheckCircle2, AlertTriangle, Clock, Cpu, DollarSign,
  TrendingUp, Zap, ShieldCheck, BarChart3, ArrowUpRight,
  Activity, ListOrdered, Lock
} from "lucide-react";
import Link from "next/link";
import { useRun } from "@/hooks/useRuns";
import { useTeams } from "@/hooks/useTeams";
import { usePass1Stats } from "@/hooks/useScores";
import { useDisputes } from "@/hooks/useDisputes";
import { formatCurrency, formatDuration, formatUtcTime, cn } from "@/lib/utils";
import type { Pass1Stats, RunState, Team } from "@/types";
import BandChart from "@/components/scores/BandChart";

function MetricBlock({ label, value, sub, green = false }: { label: string; value: string; sub?: string; green?: boolean }) {
  return (
    <div className={cn("p-4 rounded-2xl", green ? "bento-card-green" : "bento-card")}>
      <div className={cn("text-[10px] font-semibold uppercase tracking-widest mb-1", green ? "text-green-200" : "text-brand-400")}>
        {label}
      </div>
      <div className={cn("text-2xl font-bold tracking-tight", green ? "text-white" : "text-brand-950")}>
        {value}
      </div>
      {sub && <div className={cn("text-[11px] mt-0.5", green ? "text-green-200" : "text-brand-500")}>{sub}</div>}
    </div>
  );
}

function ActivityFeed({ activity }: { activity?: Pass1Stats["recentActivity"] }) {
  const events = (activity ?? []).map((a) => ({
    time: a.time,
    msg:
      a.status === "scored"
        ? `${a.id} scored ${a.score?.toFixed(1) ?? "—"} — ${a.band ?? "unbanded"}`
        : `${a.id} is being scored`,
    type: a.status === "scored" ? "success" : "info",
  }));

  const colors: Record<string, string> = {
    success: "text-brand-700 bg-brand-100 border-brand-200",
    warn: "text-amber-700 bg-amber-50 border-amber-200",
    info: "text-blue-700 bg-blue-50 border-blue-200",
  };

  return (
    <div className="bento-card p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-brand-900">Live Activity</h3>
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600" />
        </span>
      </div>
      <div className="space-y-2 flex-1 overflow-y-auto">
        {events.length === 0 && <div className="text-xs text-brand-400">No recent activity yet.</div>}
        {events.map((e, i) => (
          <div key={i} className={cn("flex items-start gap-2 rounded-lg border px-3 py-2 text-xs", colors[e.type])}>
            <span className="text-[10px] font-mono text-inherit/70 shrink-0 mt-0.5">{e.time}</span>
            <span className="font-medium">{e.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StageFunnel({ teams, run }: { teams: Team[]; run?: RunState }) {
  const total = teams.length;
  const ingested = total;
  const pass1 = teams.filter(t => t.pass1 !== undefined).length;
  const pass2 = teams.filter(t => t.pass2Score !== undefined).length;
  
  const teamFinalShortlistCount = teams.filter((team) => team.finalRank !== undefined).length;
  const stages = [
    { label: "Registered", count: ingested, icon: Users, href: "/ingest" },
    { label: "Pass-1 Scored", count: pass1, icon: Activity, href: "/pass1" },
    { label: "Pass-2 Candidates", count: run?.p2Promoted ?? 0, icon: CheckCircle2, href: "/pass2" },
    { label: "Final Shortlist", count: teamFinalShortlistCount, icon: Lock, href: "/freeze" },
  ];

  return (
    <div className="bento-card p-5">
      <h3 className="text-sm font-semibold text-brand-900 mb-4">Pipeline Funnel</h3>
      <div className="space-y-3">
        {stages.map((s, i) => {
          const pct = Math.round((s.count / ingested) * 100);
          return (
            <Link key={i} href={s.href} className="block group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <s.icon className="h-3.5 w-3.5 text-brand-600" />
                  <span className="text-xs font-medium text-brand-800 group-hover:text-brand-950">{s.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-brand-900">{s.count}</span>
                  <span className="text-[10px] text-brand-400">{pct}%</span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-brand-100 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-brand-700 to-brand-500 transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function BudgetCard({ run }: { run?: RunState }) {
  const spent = run?.estimatedCost ?? 0;
  const budget = run?.budgetLimit ?? 0;
  const pct = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const overBudget = pct >= 100;

  return (
    <div className={cn("bento-card p-5", overBudget && "border-red-200 bg-red-50")}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-brand-600" />
          <span className="text-xs font-semibold text-brand-700">Budget Usage</span>
        </div>
        {overBudget && <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />}
      </div>
      <div className="flex items-end gap-2 mt-2 mb-3">
        <span className="text-2xl font-bold text-brand-950">{formatCurrency(spent)}</span>
        <span className="text-sm text-brand-400 mb-0.5">/ {formatCurrency(budget)}</span>
      </div>
      <div className="h-3 rounded-full bg-brand-100 overflow-hidden">
        <div
          className={cn("h-3 rounded-full transition-all", overBudget ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-brand-600")}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <div className="text-[10px] text-brand-400 mt-1.5">{pct}% consumed</div>
    </div>
  );
}

function WorkerCard({ run }: { run?: RunState }) {
  const active = run?.activeWorkers ?? 0;
  const total = run?.totalWorkers ?? 0;
  const idle = total - active;

  return (
    <div className="bento-card p-5">
      <div className="flex items-center gap-2 mb-2">
        <Cpu className="h-4 w-4 text-brand-600" />
        <span className="text-xs font-semibold text-brand-700">Worker Pool</span>
      </div>
      <div className="flex items-end gap-1.5 mt-2 mb-3">
        <span className="text-2xl font-bold text-brand-950">{active}</span>
        <span className="text-sm text-brand-400 mb-0.5">/ {total} workers</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-5 flex-1 rounded-sm",
              i < active ? "bg-brand-600" : "bg-brand-100"
            )}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] mt-1.5">
        <span className="text-brand-500">{active} active</span>
        <span className="text-brand-300">{idle} idle</span>
      </div>
    </div>
  );
}

function BandSummaryCard({ stats, incomplete }: { stats?: Pass1Stats; incomplete?: number }) {
  const bands = [
    { label: "FAST TRACK", count: stats?.bands.fastTrack ?? 0, color: "bg-brand-600", textColor: "text-brand-700" },
    { label: "BORDERLINE", count: stats?.bands.borderline ?? 0, color: "bg-amber-500", textColor: "text-amber-700" },
    { label: "REJECT", count: stats?.bands.reject ?? 0, color: "bg-red-500", textColor: "text-red-700" },
    { label: "INCOMPLETE", count: incomplete ?? 0, color: "bg-gray-400", textColor: "text-gray-600" },
  ];
  const total = bands.reduce((s, b) => s + b.count, 0);

  return (
    <div className="bento-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-brand-900">Band Distribution</h3>
        <span className="text-xs text-brand-400">{total} teams</span>
      </div>
      {/* Stacked bar */}
      <div className="flex h-4 rounded-full overflow-hidden gap-0.5 mb-4">
        {bands.map((b) => (
          <div
            key={b.label}
            className={cn("h-full transition-all", b.color)}
            style={{ width: `${total > 0 ? (b.count / total) * 100 : 0}%` }}
            title={`${b.label}: ${b.count}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {bands.map((b) => (
          <div key={b.label} className="flex items-center gap-2">
            <div className={cn("h-2.5 w-2.5 rounded-sm shrink-0", b.color)} />
            <span className="text-[11px] text-brand-600 flex-1">{b.label}</span>
            <span className={cn("text-[11px] font-semibold", b.textColor)}>{b.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: run } = useRun();
  const { data: teamsData } = useTeams({});
  const teams = teamsData?.teams ?? [];
  const { data: stats } = usePass1Stats();
  const { data: disputeItems } = useDisputes();

  const elapsed = run ? formatDuration(run.elapsedSeconds) : "—";
  const isFrozen = run?.status === "FROZEN";
  const isRunning = run?.status === "RUNNING";

  const pass2Candidates = run?.p2Promoted ?? 0;
  const finalShortlistTarget = run?.shortlistSize ?? 0;
  const finalShortlistCount = teams.filter((team) => team.finalRank !== undefined).length;
  const pendingDisputes = disputeItems?.filter(d => d.status === "PENDING").length;

  return (
    <div className="p-6 space-y-6">
      {/* Hero status bar */}
      <div className="bento-card-green p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isRunning ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-green-100 bg-white/10 rounded-full px-3 py-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-300 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-200" />
                </span>
                PIPELINE ACTIVE
              </span>
            ) : isFrozen ? (
              <span className="text-xs font-semibold text-purple-200 bg-white/10 rounded-full px-3 py-1">❄ FROZEN</span>
            ) : (
              <span className="text-xs font-semibold text-green-200 bg-white/10 rounded-full px-3 py-1">IDLE</span>
            )}
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">KnowCode 4.0 — Evaluation Console</h1>
          <p className="text-green-200 text-xs mt-0.5">
            Run #{run?.id ?? "—"} · Started {formatUtcTime(run?.startedAt)} · {elapsed} elapsed
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link href="/pass1" className="rounded-xl bg-white/15 hover:bg-white/25 px-4 py-2 text-xs font-semibold text-white transition-colors border border-white/20">
            Pass-1 Monitor →
          </Link>
          <Link href="/freeze" className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-brand-800 hover:bg-green-50 transition-colors shadow-sm">
            Freeze Shortlist
          </Link>
        </div>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-12 gap-4">

        {/* Row 1: Key stats */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <MetricBlock label="Teams Registered" value={`${run?.totalTeams ?? "—"}`} sub={`${run?.incompleteTeams ?? "—"} incomplete`} />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <MetricBlock label="Pass-1 Progress" value={`${stats ? stats.scoredCount : "—"}`} sub={`of ${stats ? stats.totalComplete : "—"} complete`} green />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <MetricBlock label="Pass-2 Candidates" value={`${pass2Candidates}`} sub={`${run?.p2Running ?? 0} running · ${run?.p2Queued ?? 0} queued`} />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <MetricBlock label="Final Shortlist Target" value={`${finalShortlistTarget || "—"}`} sub={`${finalShortlistCount} in final shortlist`} />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <MetricBlock label="Final Shortlist" value={`${finalShortlistCount}`} sub={`${finalShortlistTarget ? `target ${finalShortlistTarget}` : "target unavailable"}`} />
        </div>

        {/* Row 2: Funnel + Activity */}
        <div className="col-span-12 lg:col-span-4">
          <StageFunnel teams={teams} run={run} />
        </div>
        <div className="col-span-12 lg:col-span-5 row-span-2">
          <ActivityFeed activity={stats?.recentActivity} />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <WorkerCard run={run} />
        </div>

        {/* Row 3: Band dist + Budget */}
        <div className="col-span-12 lg:col-span-4">
          <BandSummaryCard stats={stats} incomplete={run?.incompleteTeams} />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <BudgetCard run={run} />
        </div>

        {/* Row 4: Score histogram - full width */}
        <div className="col-span-12">
          <div className="bento-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-brand-900">Score Distribution (Pass-1)</h3>
              <Link href="/pass1" className="text-xs text-brand-600 hover:text-brand-800 font-medium flex items-center gap-1">
                Full Report <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <BandChart bands={stats?.bands} scoreBuckets={stats?.scoreBuckets} />
          </div>
        </div>

        {/* Quick nav cards */}
        {[
          { href: "/disputes", icon: AlertTriangle, label: "Disputes", count: pendingDisputes ?? null, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
          { href: "/freeze", icon: ShieldCheck, label: "Freeze Console", count: null, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
          { href: "/pipeline", icon: BarChart3, label: "Pipeline DAG", count: null, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
        ].map((item) => (
          <Link key={item.href} href={item.href} className={cn("col-span-12 sm:col-span-4 flex items-center gap-3 rounded-2xl border p-4 hover:shadow-md transition-all", item.bg, item.border)}>
            <item.icon className={cn("h-5 w-5", item.color)} />
            <span className="text-sm font-semibold text-brand-900">{item.label}</span>
            {item.count != null && (
              <span className={cn("ml-auto rounded-full px-2.5 py-0.5 text-xs font-bold", item.bg, item.color, "border", item.border)}>
                {item.count}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
