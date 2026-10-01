"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Cpu, DollarSign, AlertTriangle } from "lucide-react";
import { useRun } from "@/hooks/useRuns";
import { runPath } from "@/lib/run-path";
import { formatCurrency, formatDuration } from "@/lib/utils";
import { TELEMETRY_MODE } from "@/config/demo";

export default function Header({ runId }: { runId: string | null }) {
  const { data: run } = useRun();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!run?.startedAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [run?.startedAt]);

  const startedAt = run?.startedAt ? new Date(run.startedAt).getTime() : NaN;
  const elapsed = Number.isFinite(startedAt) ? formatDuration(Math.max(0, Math.floor((now - startedAt) / 1000))) : null;
  const brandHref = runId ? runPath(runId, "dashboard") : "/";

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-brand-100 bg-white/95 px-5 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="flex items-center gap-4">
        <Link href={brandHref} className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-800 text-white font-bold text-sm shadow-sm">
            KC
          </div>
          <div>
            <span className="font-semibold text-brand-950 text-sm tracking-tight">KnowCode 4.0</span>
            {run?.name && <p className="text-[10px] text-brand-500 truncate max-w-[200px]">{run.name}</p>}
          </div>
        </Link>
        <Link href="/" className="text-[11px] font-semibold text-brand-600 hover:text-brand-900">
          All runs
        </Link>
      </div>

      <div className="hidden lg:flex items-center gap-6 text-xs text-brand-700">
        {elapsed && (
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-brand-500" />
            <span className="text-brand-400">Elapsed</span>
            <span className="font-semibold text-brand-900">{elapsed}</span>
          </div>
        )}
        {TELEMETRY_MODE === "static" && (
          <>
            <div className="flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-brand-500" />
              <span className="text-brand-400">Workers</span>
              <span className="font-semibold text-brand-900">
                {run?.activeWorkers ?? "—"}/{run?.totalWorkers ?? "—"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-brand-500" />
              <span className="text-brand-400">Cost</span>
              <span className="font-semibold text-brand-900">{formatCurrency(run?.estimatedCost)}</span>
            </div>
            {run?.isBudgetKillSwitchTriggered === true && (
              <div className="flex items-center gap-1 text-red-600 font-semibold text-xs animate-pulse">
                <AlertTriangle className="h-3.5 w-3.5" /> Budget Limit
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
}
