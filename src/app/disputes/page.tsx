"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertOctagon, ShieldCheck, CheckCircle2, Lock, ArrowRight, Filter } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import DisputePacket from "@/components/review/DisputePacket";
import { useDisputes } from "@/hooks/useDisputes";
import { useUIStore } from "@/store/uiStore";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function DisputesPage() {
  const { data: disputes, isLoading } = useDisputes();
  const { userRole } = useUIStore();
  const [filterMode, setFilterMode] = useState<"ALL" | "PENDING" | "RESOLVED" | "DISMISSED">("ALL");

  if (isLoading || !disputes) {
    return (
      <PageContainer title="Auditor Dispute Queue" description="Loading disputes...">
        <div className="flex h-96 items-center justify-center">
          <div className="flex w-full max-w-xl flex-col gap-3 font-mono text-xs text-gray-500">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </PageContainer>
    );
  }

  const canOverride = userRole === "auditor" || userRole === "admin";
  const pendingCount = disputes.filter((d) => d.status === "PENDING").length;
  const resolvedCount = disputes.filter((d) => d.status === "RESOLVED").length;
  const dismissedCount = disputes.filter((d) => d.status === "DISMISSED").length;

  const filteredDisputes = disputes.filter((d) => {
    if (filterMode === "PENDING") return d.status === "PENDING";
    if (filterMode === "RESOLVED") return d.status === "RESOLVED";
    if (filterMode === "DISMISSED") return d.status === "DISMISSED";
    return true;
  });

  return (
    <PageContainer
      title="Human Gate & Dispute Review Queue"
      description="Auditor intervention gate for candidate reviews, integrity flags, re-classification petitions, and score overrides."
      badge={
        <Badge variant="secondary" className="rounded bg-amber-950/70 px-2.5 py-0.5 text-xs font-mono text-amber-300 border border-amber-800/60 font-bold animate-pulse">
          {pendingCount} Teams Require Review
        </Badge>
      }
      actions={
        <Link
          href="/freeze"
          className="flex items-center gap-1.5 rounded bg-purple-600 hover:bg-purple-500 px-3.5 py-1.5 text-xs font-mono font-bold text-white transition-colors"
        >
          <Lock className="h-3.5 w-3.5" />
          <span>Proceed to Freeze Console</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Permission Status Callout */}
        {!canOverride && (
          <div className="rounded-lg border border-red-900/60 bg-red-950/20 p-4 text-xs font-mono text-red-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-red-400 shrink-0" />
              <span>
                You are currently signed in with the <strong>{userRole.toUpperCase()}</strong> role. Overrides are restricted to <strong>auditor</strong> and <strong>admin</strong> accounts.
              </span>
            </div>
            <span className="text-[10px] text-red-400 underline">Switch role in top-right header</span>
          </div>
        )}

        {/* Filter Tabs & Queue Metrics */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
          <div className="flex items-center gap-1 rounded bg-white p-1 border border-gray-200">
            <button
              onClick={() => setFilterMode("ALL")}
              className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                filterMode === "ALL"
                  ? "bg-gray-50 text-gray-950 font-bold"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              All Disputes ({disputes.length})
            </button>
            <button
              onClick={() => setFilterMode("PENDING")}
              className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                filterMode === "PENDING"
                  ? "bg-amber-950/70 text-amber-300 font-bold border border-amber-800/60"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilterMode("RESOLVED")}
              className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                filterMode === "RESOLVED"
                  ? "bg-emerald-950/70 text-emerald-300 font-bold border border-emerald-800/60"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Resolved ({resolvedCount})
            </button>
            <button
              onClick={() => setFilterMode("DISMISSED")}
              className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                filterMode === "DISMISSED"
                  ? "bg-slate-800 text-white font-bold border border-slate-700"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Dismissed ({dismissedCount})
            </button>
          </div>

          <div className="text-xs font-mono text-gray-500">
            {pendingCount === 0 ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> All promoted teams reviewed
              </span>
            ) : (
              <span>Auditor action required before final freeze</span>
            )}
          </div>
        </div>

        {/* Dispute Cards List */}
        {filteredDisputes.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-gray-800">No disputes in this view</h4>
            <p className="text-xs text-gray-400 font-mono mt-1">
              All candidate items for this filter have been addressed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDisputes.map((dispute) => (
              <DisputePacket key={dispute.id} dispute={dispute} />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
