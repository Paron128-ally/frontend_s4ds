"use client";

import React from "react";
import { DollarSign, AlertTriangle, ShieldCheck, Gauge } from "lucide-react";
import { RunState } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface CostTickerProps {
  run: RunState;
}

export default function CostTicker({ run }: CostTickerProps) {
  const percentUsed = Math.round((run.estimatedCost / run.budgetLimit) * 100);
  const isCloseToBudget = percentUsed >= 75;

  return (
    <div className="bento-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-brand-600" />
          <h3 className="text-xs uppercase tracking-wider text-brand-700 font-semibold">
            Cost & Cloud Budget
          </h3>
        </div>
        <span
          className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
            isCloseToBudget
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-brand-50 text-brand-700 border-brand-200"
          }`}
        >
          {percentUsed}% OF BUDGET USED
        </span>
      </div>

      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-2xl font-bold text-brand-800">
            {formatCurrency(run.estimatedCost)}
          </span>
          <span className="text-xs text-brand-400 ml-2">
            / limit {formatCurrency(run.budgetLimit)}
          </span>
        </div>
        <span className="text-xs text-brand-400">
          Rem: {formatCurrency(Math.max(0, run.budgetLimit - run.estimatedCost))}
        </span>
      </div>

      {/* Budget Gauge Bar */}
      <div className="w-full bg-brand-100 h-2.5 rounded-full overflow-hidden flex">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            isCloseToBudget ? "bg-amber-500" : "bg-brand-600"
          }`}
          style={{ width: `${Math.min(100, percentUsed)}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] border-t border-brand-100 pt-3">
        <div className="rounded-xl bg-brand-50 p-2.5 border border-brand-100">
          <span className="text-brand-400 block">Pass-1 (Cheap):</span>
          <span className="font-bold text-brand-900">{formatCurrency(run.p1Cost)}</span>
          <span className="text-[10px] text-brand-400 block">~$0.04 / complete team</span>
        </div>
        <div className="rounded-xl bg-blue-50 p-2.5 border border-blue-100">
          <span className="text-blue-400 block">Pass-2 (Deep):</span>
          <span className="font-bold text-blue-700">{formatCurrency(run.p2Cost)}</span>
          <span className="text-[10px] text-blue-400 block">~$0.042 / promoted team</span>
        </div>
      </div>

      {run.isBudgetKillSwitchTriggered && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-2.5 border border-red-200 text-red-700 text-xs font-semibold">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
          <span>Budget killswitch armed. Automatic worker throttling active.</span>
        </div>
      )}
    </div>
  );
}
