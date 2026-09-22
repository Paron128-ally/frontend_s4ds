"use client";

import React from "react";
import Link from "next/link";
import { Clock, Cpu, DollarSign, AlertTriangle } from "lucide-react";
import { useRun } from "@/hooks/useRuns";
import { useUIStore } from "@/store/uiStore";
import { formatCurrency, formatDuration } from "@/lib/utils";
import { UserRole } from "@/types";

export default function Header() {
  const { data: run } = useRun();
  const { userRole, setUserRole } = useUIStore();

  const isFrozen = run?.status === "FROZEN";
  const isRunning = run?.status === "RUNNING";

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-brand-100 bg-white/95 px-5 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
      {/* Brand */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-800 text-white font-bold text-sm shadow-sm">
            KC
          </div>
          <div>
            <span className="font-semibold text-brand-950 text-sm tracking-tight">KnowCode 4.0</span>
            <span className="ml-2 rounded-md bg-brand-100 px-1.5 py-0.5 text-[10px] font-medium text-brand-700">Agentic Shortlister</span>
          </div>
        </Link>

        {/* Live status pill */}
        <div className="hidden sm:flex items-center">
          {isFrozen ? (
            <div className="status-pill bg-purple-100 text-purple-800 border border-purple-200">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
              FROZEN
            </div>
          ) : isRunning ? (
            <div className="status-pill bg-brand-100 text-brand-800 border border-brand-200">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-600" />
              </span>
              RUN ACTIVE
            </div>
          ) : (
            <div className="status-pill bg-gray-100 text-gray-600 border border-gray-200">
              {run?.status || "IDLE"}
            </div>
          )}
        </div>
      </div>

      {/* Center telemetry */}
      <div className="hidden lg:flex items-center gap-6 text-xs text-brand-700">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-brand-500" />
          <span className="text-brand-400">Elapsed</span>
          <span className="font-semibold text-brand-900">{run ? formatDuration(run.elapsedSeconds) : "—"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Cpu className="h-3.5 w-3.5 text-brand-500" />
          <span className="text-brand-400">Workers</span>
          <span className="font-semibold text-brand-900">{run ? `${run.activeWorkers}/${run.totalWorkers}` : "—"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <DollarSign className="h-3.5 w-3.5 text-brand-500" />
          <span className="text-brand-400">Cost</span>
          <span className="font-semibold text-brand-900">{run ? formatCurrency(run.estimatedCost) : "—"}</span>
          <span className="text-brand-300 text-[10px]">/ {run ? formatCurrency(run.budgetLimit) : "—"}</span>
        </div>
        {run?.isBudgetKillSwitchTriggered && (
          <div className="flex items-center gap-1 text-red-600 font-semibold text-xs animate-pulse">
            <AlertTriangle className="h-3.5 w-3.5" /> Budget Limit
          </div>
        )}
      </div>

      {/* Role + User */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1">
          <span className="text-[11px] text-brand-500 font-medium">Role:</span>
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value as UserRole)}
            className="bg-transparent text-xs font-semibold text-brand-800 focus:outline-none cursor-pointer"
          >
            <option value="ops">ops</option>
            <option value="auditor">auditor</option>
            <option value="admin">admin</option>
          </select>
        </div>

        <div className="flex items-center gap-2 border-l border-brand-100 pl-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-800 text-white text-xs font-bold">J</div>
          <div className="hidden md:block">
            <div className="text-xs font-semibold text-brand-900">Jane Doe</div>
            <div className="text-[10px] text-brand-400 uppercase tracking-wider">{userRole}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
