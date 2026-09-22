"use client";

import React, { useState } from "react";
import { useTeams } from "@/hooks/useTeams";
import { useStartIngest } from "@/hooks/useRuns";
import { AlertTriangle, CheckCircle2, Clock, Upload, RotateCw, Play, AlertCircle } from "lucide-react";
import { cn, formatUtcTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Team } from "@/types";

type IncompleteItem = Team | { id: string; name: string; reasons: string[] };

export default function IngestPage() {
  const { data: teamsData, isLoading, refetch } = useTeams({});
  const teams = teamsData?.teams ?? [];
  const incomplete = teams.filter((t) => t.status === "INCOMPLETE");
  const complete = teams.filter((t) => t.status !== "INCOMPLETE");

  const ingestMutation = useStartIngest();
  const [lastResult, setLastResult] = useState<{
    dryRun: boolean;
    rowsDetected: number;
    complete: number;
    incomplete: number;
    queuedForP1: number;
    incompleteList: { id: string; name: string; reasons: string[] }[];
  } | null>(null);

  const handleIngest = async (dryRun: boolean) => {
    try {
      const result = await ingestMutation.mutateAsync(dryRun);
      setLastResult(result);
      // Refetch teams after actual ingest (not dry run)
      if (!dryRun) {
        refetch();
      }
    } catch (err) {
      console.error("Ingest failed:", err);
    }
  };

  const displayIncomplete = (lastResult?.incompleteList ?? incomplete) as IncompleteItem[];

  // Type guards for IncompleteItem
  const getTrack = (item: IncompleteItem): string => {
    return "track" in item ? item.track : "new_idea";
  };

  const getReasons = (item: IncompleteItem): string[] => {
    return "reasons" in item ? item.reasons : (item.incompleteReasons ?? ["Missing required fields"]);
  };

  const getUpdatedAt = (item: IncompleteItem): string | undefined => {
    return "updatedAt" in item ? item.updatedAt : undefined;
  };

  const getCreatedAt = (item: IncompleteItem): string | undefined => {
    return "createdAt" in item ? item.createdAt : undefined;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-950">Registration Ingest</h1>
          <p className="text-xs text-brand-500 mt-0.5">Monitor incoming team registrations and validate completeness</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2">
          <Upload className="h-4 w-4 text-brand-600" />
          <span className="text-sm font-semibold text-brand-800">{teams.length} teams ingested</span>
        </div>
      </div>

      {/* Stats bento */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bento-card-green p-5">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-green-200 mb-1">Total Registered</div>
          <div className="text-3xl font-bold text-white">{lastResult?.rowsDetected ?? teams.length}</div>
        </div>
        <div className="bento-card p-5">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-brand-400 mb-1">Complete</div>
          <div className="text-3xl font-bold text-brand-950">{lastResult?.complete ?? complete.length}</div>
          <div className="text-xs text-brand-500 mt-0.5">
            {teams.length > 0
              ? Math.round(((lastResult?.complete ?? complete.length) / teams.length) * 100)
              : 0}% of total
          </div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-amber-600 mb-1">Incomplete</div>
          <div className="text-3xl font-bold text-amber-700">{lastResult?.incomplete ?? incomplete.length}</div>
          <div className="text-xs text-amber-500 mt-0.5">Needs attention</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() => handleIngest(true)}
          disabled={ingestMutation.isPending}
          className="flex items-center gap-2"
        >
          <RotateCw className={cn("h-4 w-4", ingestMutation.isPending && "animate-spin")} />
          <span>Dry Run / Validate</span>
        </Button>
        <Button
          onClick={() => handleIngest(false)}
          disabled={ingestMutation.isPending}
          className="flex items-center gap-2"
        >
          <Play className={cn("h-4 w-4", ingestMutation.isPending && "animate-spin")} />
          <span>Start Ingest</span>
        </Button>
      </div>

      {/* Mutation Status */}
      {ingestMutation.isPending && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 flex items-center gap-3 text-sm text-blue-800">
          <RotateCw className="h-5 w-5 animate-spin" />
          <span>
            {ingestMutation.variables ? "Running ingest..." : "Validating registrations..."}
          </span>
        </div>
      )}
      {ingestMutation.isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-center gap-3 text-sm text-red-800">
          <AlertCircle className="h-5 w-5" />
          <span>Error: {ingestMutation.error?.message ?? "Ingest failed"}</span>
        </div>
      )}
      {ingestMutation.isSuccess && !ingestMutation.isPending && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex items-center gap-3 text-sm text-green-800">
          <CheckCircle2 className="h-5 w-5" />
          <span>
            {ingestMutation.variables ? "Ingest started successfully" : "Validation complete"}
          </span>
        </div>
      )}

      {/* Incomplete teams */}
      {displayIncomplete.length > 0 && (
        <div className="bento-card overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-brand-100 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <h2 className="text-sm font-semibold text-amber-800">
              Incomplete Registrations ({displayIncomplete.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="ops-table w-full">
              <thead>
                <tr>
                  <th className="text-left">Team ID</th>
                  <th className="text-left">Team Name</th>
                  <th className="text-left">Track</th>
                  <th className="text-left">Missing Fields</th>
                  <th className="text-left">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {displayIncomplete.map((t) => (
                  <tr key={t.id}>
                    <td className="font-mono text-[11px] text-brand-500">{t.id}</td>
                    <td className="font-semibold text-brand-900">{t.name}</td>
                    <td>
                      <span className="status-pill badge-blue">{getTrack(t)}</span>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {getReasons(t).map((reason, idx) => (
                          <Badge key={idx} variant="secondary" className="text-[9px] rounded bg-amber-950/60 px-2 py-0.5 text-amber-300 border border-amber-800/60 font-mono">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="text-brand-400 text-[11px]">{formatUtcTime(getUpdatedAt(t) ?? getCreatedAt(t))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All teams table */}
      <div className="bento-card overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-brand-100">
          <CheckCircle2 className="h-4 w-4 text-brand-600" />
          <h2 className="text-sm font-semibold text-brand-900">
            All Registrations ({teams.length} total)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="ops-table w-full">
            <thead>
              <tr>
                <th className="text-left">Team ID</th>
                <th className="text-left">Name</th>
                <th className="text-left">Track</th>
                <th className="text-left">Members</th>
                <th className="text-left">Status</th>
                <th className="text-left">Registered</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-brand-400 text-sm">
                    Loading...
                  </td>
                </tr>
              ) : (
                teams.map((t) => (
                  <tr key={t.id}>
                    <td className="font-mono text-[11px] text-brand-500">{t.id}</td>
                    <td className="font-semibold text-brand-900">{t.name}</td>
                    <td>
                      <span className="status-pill badge-blue text-[10px]">{t.track}</span>
                    </td>
                    <td className="text-brand-600">{t.memberCount ?? "—"}</td>
                    <td>
                      <span
                        className={cn(
                          "status-pill text-[10px]",
                          t.status === "INCOMPLETE" ? "badge-amber" : "badge-green"
                        )}
                      >
                        {t.status === "INCOMPLETE" ? "Incomplete" : "Complete"}
                      </span>
                    </td>
                    <td className="text-brand-400 text-[11px]">{formatUtcTime(t.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
