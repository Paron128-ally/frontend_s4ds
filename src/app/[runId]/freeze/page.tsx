"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ListOrdered, ArrowLeft } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import FreezeConfirm from "@/components/freeze/FreezeConfirm";
import { useRunHref } from "@/hooks/useRunHref";
import { useRun } from "@/hooks/useRuns";
import { usePass1Stats } from "@/hooks/useScores";

export default function FreezePage() {
  const round2Href = useRunHref("pass2");
  const { data: run } = useRun();
  const { data: stats } = usePass1Stats();
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
          <span className="rounded bg-brand-800 px-2.5 py-0.5 text-xs font-semibold text-white">
            Frozen
          </span>
        ) : (
          <span className="rounded bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-800">
            Ready to freeze
          </span>
        )
      }
      actions={
        <Link
          href={round2Href}
          className="flex items-center gap-1.5 rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-800 hover:bg-brand-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Inspect Round 2</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Shortlist Target Quota Controller */}
        <div className="rounded-lg border border-brand-200 bg-white p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-brand-50 p-2.5 text-brand-700">
                <ListOrdered className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-brand-950">
                  Final shortlist size
                </h3>
                <p className="text-xs text-brand-500">
                  Target size for this run
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-brand-500">Shortlist size:</span>
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
                className="w-28 rounded border border-brand-200 bg-white px-3 py-1.5 text-xs font-bold text-brand-950 focus:border-brand-600 focus:outline-none disabled:opacity-50"
              />
              <span className="text-brand-500">teams</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="rounded-lg border border-brand-100 bg-brand-50 p-3">
              <span className="mb-1 block text-brand-500">Target</span>
              <span className="text-xl font-bold text-brand-950">{currentShortlistSize}</span>
            </div>
            <div className="rounded-lg border border-brand-100 bg-brand-50 p-3">
              <span className="mb-1 block text-brand-500">Promoted</span>
              <span className="text-xl font-bold text-brand-800">{run?.p2Promoted ?? "—"}</span>
            </div>
            <div className="rounded-lg border border-brand-100 bg-brand-50 p-3">
              <span className="mb-1 block text-brand-500">Round 2 scored</span>
              <span className="text-xl font-bold text-brand-800">{run?.p2Completed ?? "—"}</span>
            </div>
            <div className="rounded-lg border border-brand-100 bg-brand-50 p-3">
              <span className="mb-1 block text-brand-500">Rejected</span>
              <span className="text-xl font-bold text-brand-800">{stats ? stats.bands.reject : "—"}</span>
            </div>
          </div>
        </div>

        {/* Freeze Confirmation & Action Component */}
        <FreezeConfirm shortlistSize={currentShortlistSize} />
      </div>
    </PageContainer>
  );
}
