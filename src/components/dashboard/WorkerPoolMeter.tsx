"use client";

import React from "react";
import { Cpu, Zap, Activity } from "lucide-react";
import { RunState } from "@/types";

interface WorkerPoolMeterProps {
  run: RunState;
}

export default function WorkerPoolMeter({ run }: WorkerPoolMeterProps) {
  const idleWorkers = run.totalWorkers - run.activeWorkers;
  const activePercent = Math.round((run.activeWorkers / run.totalWorkers) * 100);

  return (
    <div className="bento-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-brand-600" />
          <h3 className="text-xs uppercase tracking-wider text-brand-700 font-semibold">
            Async Worker Pool
          </h3>
        </div>
        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          CONCURRENCY: {run.totalWorkers} MAX
        </span>
      </div>

      {/* Meter Bar */}
      <div className="space-y-1.5">
        <div className="w-full bg-brand-100 h-3 rounded-full overflow-hidden flex">
          <div
            className="bg-gradient-to-r from-brand-700 to-brand-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${activePercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <span className="flex items-center gap-1.5 text-brand-700 font-medium">
            <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
            {run.activeWorkers} Active Workers
          </span>
          <span className="text-brand-400">
            {idleWorkers} Idle
          </span>
          <span className="text-amber-600 font-medium">
            Queue: {run.p1Queued + run.p2Queued} tasks
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] border-t border-brand-100 pt-3">
        <div className="rounded-xl bg-brand-50 p-2.5 border border-brand-100">
          <span className="text-brand-400 block">P1 Cheap Scorer:</span>
          <span className="font-bold text-brand-900">28 workers assigned</span>
        </div>
        <div className="rounded-xl bg-blue-50 p-2.5 border border-blue-100">
          <span className="text-blue-400 block">P2 Deep Reviewers:</span>
          <span className="font-bold text-blue-700">14 workers assigned</span>
        </div>
      </div>
    </div>
  );
}
