"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ListOrdered, Download, Filter, AlertOctagon, Lock } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import TeamTable from "@/components/teams/TeamTable";
import TeamFilters from "@/components/teams/TeamFilters";
import { useTeams } from "@/hooks/useTeams";
import { useUIStore } from "@/store/uiStore";

export default function ShortlistPage() {
  const {
    searchQuery,
    statusFilter,
    bandFilter,
    trackFilter,
    integrityOnly,
    overriddenOnly,
    minScore,
    maxScore,
    sortBy,
    sortOrder,
  } = useUIStore();

  const { data: teamsData, isLoading } = useTeams({
    search: searchQuery,
    status: statusFilter,
    band: bandFilter,
    track: trackFilter,
    integrityOnly,
    overriddenOnly,
    minScore,
    maxScore,
    sortBy,
    sortOrder,
  });

  // Create a key that changes when filters change to reset pagination
  const resetKey = useMemo(
    () => {
      let hash = 0;
      const str = `${searchQuery}-${statusFilter}-${bandFilter}-${trackFilter}-${integrityOnly}-${overriddenOnly}-${minScore}-${maxScore}-${sortBy}-${sortOrder}`;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }
      return Math.abs(hash);
    },
    [searchQuery, statusFilter, bandFilter, trackFilter, integrityOnly, overriddenOnly, minScore, maxScore, sortBy, sortOrder]
  );

  return (
    <PageContainer
      title="Candidate Shortlist & Ranking Console"
      description="Ranked evaluation table for all registered teams. Filter by Pass-1 operational bands, Pass-2 deep scores, integrity flags, or auditor overrides."
      badge={
        <span className="rounded bg-emerald-950/70 px-2 py-0.5 text-xs font-mono text-emerald-300 border border-emerald-800/60 font-bold">
          Shortlist Quota Active
        </span>
      }
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/disputes"
            className="flex items-center gap-1.5 rounded border border-amber-800/60 bg-amber-950/40 hover:bg-amber-900/40 px-3 py-1.5 text-xs font-mono text-amber-300 transition-colors"
          >
            <AlertOctagon className="h-3.5 w-3.5" />
            <span>Disputes Queue</span>
          </Link>
          <Link
            href="/freeze"
            className="flex items-center gap-1.5 rounded bg-purple-600 hover:bg-purple-500 px-3.5 py-1.5 text-xs font-mono font-bold text-white transition-colors"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Freeze Shortlist</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Search & Filter Controls */}
        <TeamFilters />

        {/* Dense Team Evaluation Table */}
        <TeamTable
          key={resetKey}
          teams={teamsData?.teams || []}
          total={teamsData?.total || 250}
          filtered={teamsData?.filtered || 0}
          isLoading={isLoading}
        />
      </div>
    </PageContainer>
  );
}
