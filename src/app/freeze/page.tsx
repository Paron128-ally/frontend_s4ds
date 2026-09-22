"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, AlertTriangle, CheckCircle2, ShieldAlert, Download, ListOrdered, ArrowLeft } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import FreezeConfirm from "@/components/freeze/FreezeConfirm";
import { useRun } from "@/hooks/useRuns";
import { usePass1Stats } from "@/hooks/useScores";
import { useUIStore } from "@/store/uiStore";

export default function FreezePage() {
  const { data: run } = useRun();
  const { data: stats } = usePass1Stats();
  const { userRole } = useUIStore();
  const maxShortlistSize = Math.min(
    Math.max(run?.maxShortlistTarget ?? run?.totalTeams ?? 1, 1),
    run?.totalTeams ?? Number.MAX_SAFE_INTEGER
  );
  const [shortlistSize, setShortlistSize] = useState<number | null>(null);
  const currentShortlistSize = shortlistSize ?? run?.shortlistSize ?? 1;

  const isFrozen = run?.status === "FROZEN";

  return (
    <PageContainer
      title="Shortlist Freeze & Governance Lock"
      description="Cryptographic snapshot and final seal for the 24-hour hackathon shortlisting run. Once frozen, team rankings become strictly immutable."
      badge={
        isFrozen ? (
          <span className="rounded bg-purple-950/80 px-2.5 py-0.5 text-xs font-mono text-purple-300 border border-purple-700 font-bold">
            FROZEN & IMMUTABLE
          </span>
        ) : (
          <span className="rounded bg-emerald-950/80 px-2.5 py-0.5 text-xs font-mono text-emerald-300 border border-emerald-700 font-bold">
            READY TO FREEZE
          </span>
        )
      }
      actions={
        <Link
          href="/shortlist"
          className="flex items-center gap-1.5 rounded border border-gray-300 bg-gray-50 hover:bg-gray-600 px-3 py-1.5 text-xs font-mono text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Inspect Shortlist Table</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Shortlist Target Quota Controller */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-purple-950/60 p-2.5 border border-purple-800/60 text-purple-400">
                <ListOrdered className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-950 font-sans">
                  Final Shortlist Quota Configuration
                </h3>
                <p className="text-xs text-gray-500 font-mono">
                  Official target size designated by hackathon organizers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-gray-500">Shortlist Size Quota:</span>
              <input
                type="number"
                min={1}
                max={maxShortlistSize}
                disabled={isFrozen}
                value={currentShortlistSize}
                onChange={(e) => {
                  const nextValue = Number(e.target.value);
                  const boundedValue = Number.isNaN(nextValue)
                    ? 1
                    : Math.min(Math.max(nextValue, 1), maxShortlistSize);
                  setShortlistSize(boundedValue);
                }}
                className="w-28 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-950 font-bold focus:border-purple-500 focus:outline-none disabled:opacity-50"
              />
              <span className="text-gray-500">teams</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
            <div className="rounded bg-white/60 p-3 border border-gray-200">
              <span className="text-gray-400 block mb-1">Target Candidates:</span>
              <span className="text-xl font-bold text-gray-950">{currentShortlistSize}</span>
            </div>
            <div className="rounded bg-white/60 p-3 border border-gray-200">
              <span className="text-gray-400 block mb-1">Promoted Candidates:</span>
              <span className="text-xl font-bold text-indigo-400">{run?.p2Promoted ?? "—"}</span>
            </div>
            <div className="rounded bg-white/60 p-3 border border-gray-200">
              <span className="text-gray-400 block mb-1">Pass-2 Synthesized:</span>
              <span className="text-xl font-bold text-emerald-400">{run?.p2Completed ?? "—"}</span>
            </div>
            <div className="rounded bg-white/60 p-3 border border-gray-200">
              <span className="text-gray-400 block mb-1">Reject Funnel Total:</span>
              <span className="text-xl font-bold text-red-400">{stats ? `${stats.bands.reject} Teams` : "—"}</span>
            </div>
          </div>
        </div>

        {/* Freeze Confirmation & Action Component */}
        <FreezeConfirm shortlistSize={currentShortlistSize} />
      </div>
    </PageContainer>
  );
}
