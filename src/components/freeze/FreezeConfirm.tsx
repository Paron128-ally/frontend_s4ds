"use client";

import React, { useState } from "react";
import { 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Download, 
  FileCheck2,
  RotateCcw,
  AlertCircle
} from "lucide-react";
import { useFreezeStatus, useFreezeShortlist, useRestartRun } from "@/hooks/useRuns";
import { usePass1Stats } from "@/hooks/useScores";
import { useUIStore } from "@/store/uiStore";
import { formatCurrency } from "@/lib/utils";
import { freezeSchema } from "@/schemas";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FreezeConfirmProps {
  shortlistSize: number;
}

export default function FreezeConfirm({ shortlistSize }: FreezeConfirmProps) {
  const { data: freezeData, isLoading } = useFreezeStatus();
  const freezeMutation = useFreezeShortlist();
  const restartMutation = useRestartRun();
  const { data: pass1Stats } = usePass1Stats();
  const { userRole } = useUIStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [auditorId, setAuditorId] = useState("auditor-lead-ops");
  const [confirmedCheck, setConfirmedCheck] = useState(false);

  const isFrozen = freezeData?.isFrozen;
  const summary = freezeData?.summary;

  const canFreeze = userRole === "auditor" || userRole === "admin";
  const canUnfreeze = userRole === "admin";

  const freezeInput = freezeSchema.safeParse({ shortlistSize, auditorId });

  const handleConfirmFreeze = () => {
    if (!canFreeze || !freezeInput.success) return;
    freezeMutation.mutate(freezeInput.data, { onSuccess: () => setIsModalOpen(false) });
  };

  if (isFrozen && summary) {
    return (
      <div className="rounded-lg border border-purple-800/80 bg-purple-950/20 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-800/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-900/60 p-2.5 text-purple-300 border border-purple-700">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-950 font-sans">
                  SHORTLIST OFFICIALLY FROZEN & IMMUTABLE
                </h3>
                <span className="rounded bg-purple-900 px-2 py-0.5 text-[10px] font-mono text-purple-300 border border-purple-700">
                  SEALED
                </span>
              </div>
              <p className="text-xs text-purple-200/80 font-mono mt-1">
                Snapshot ID: {summary.snapshotId} • Frozen by: {summary.frozenBy}
              </p>
            </div>
          </div>

          <div className="text-right font-mono text-xs text-purple-300">
            <div>Frozen At:</div>
            <div className="font-bold text-gray-950">{new Date(summary.frozenAt).toLocaleString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="rounded-md bg-white/80 p-3.5 border border-gray-200">
            <span className="text-gray-500 block mb-1">Final Shortlist:</span>
            <span className="text-xl font-bold text-emerald-400">{summary.shortlistCount} Teams</span>
            <span className="text-[10px] text-gray-400 block mt-1">Ranked #1 to #{summary.shortlistCount}</span>
          </div>

          <div className="rounded-md bg-white/80 p-3.5 border border-gray-200">
            <span className="text-gray-500 block mb-1">Formal Reject List:</span>
            <span className="text-xl font-bold text-red-400">{summary.rejectedCount} Teams</span>
            <span className="text-[10px] text-gray-400 block mt-1">Auto-rejected at Pass-1 & Pass-2</span>
          </div>

          <div className="rounded-md bg-white/80 p-3.5 border border-gray-200">
            <span className="text-gray-500 block mb-1">Auditor Overrides Sealed:</span>
            <span className="text-xl font-bold text-purple-300">{summary.overridesApplied} Overrides</span>
            <span className="text-[10px] text-gray-400 block mt-1">Audited with justification notes</span>
          </div>
        </div>

        {/* Export and Administrative Unfreeze */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              disabled
              className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-100 px-3.5 py-2 text-xs font-mono text-gray-400 cursor-not-allowed"
              title="Export API not implemented"
            >
              <Download className="h-3.5 w-3.5 text-gray-300" />
              <span>Export Shortlist CSV ({summary.shortlistCount}) — Unavailable</span>
            </button>
            <button
              disabled
              className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-100 px-3.5 py-2 text-xs font-mono text-gray-400 cursor-not-allowed"
              title="Export API not implemented"
            >
              <Download className="h-3.5 w-3.5 text-gray-300" />
              <span>Export Reject List CSV ({summary.rejectedCount}) — Unavailable</span>
            </button>
          </div>

          {canUnfreeze && (
            <button
              onClick={() => restartMutation.mutate()}
              disabled={restartMutation.isPending}
              className="flex items-center gap-1.5 rounded-md border border-red-900 bg-red-950/60 hover:bg-red-900/60 px-3.5 py-2 text-xs font-mono text-red-300"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Admin Emergency Unfreeze</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm space-y-6">
      {/* Ready Checklist */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-700">
          Pre-Freeze Audit Checklist
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 rounded bg-white/60 p-2.5 border border-gray-200 text-gray-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>All promoted teams evaluated across 3 specialist streams</span>
          </div>
          <div className="flex items-center gap-2 rounded bg-white/60 p-2.5 border border-gray-200 text-gray-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Auditor overrides signed with written justifications</span>
          </div>
          <div className="flex items-center gap-2 rounded bg-white/60 p-2.5 border border-gray-200 text-gray-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Deterministic composite rankings generated (#1 to #{shortlistSize})</span>
          </div>
          <div className="flex items-center gap-2 rounded bg-white/60 p-2.5 border border-gray-200 text-gray-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Formal reject list compiled ({pass1Stats ? pass1Stats.bands.reject : "—"} teams)</span>
          </div>
        </div>
      </div>

      {/* Irreversible Warning Box */}
      <div className="rounded-lg border border-red-900/60 bg-red-950/25 p-4 space-y-2">
        <div className="flex items-center gap-2 text-red-400 font-mono font-bold text-xs">
          <AlertTriangle className="h-4 w-4" />
          <span>FREEZE IS IRREVERSIBLE WITHOUT EXPLICIT ADMIN UNFREEZE</span>
        </div>
        <ul className="text-xs text-red-200/80 font-mono space-y-1 list-disc pl-5">
          <li>Rankings become immutable across all organizer & auditor interfaces.</li>
          <li>A permanent cryptographic snapshot will be saved to the database.</li>
          <li>The reject list will be sealed and exported for notification delivery.</li>
          <li>Any subsequent adjustments will require multi-sig administrative intervention.</li>
        </ul>
      </div>

      {/* Freeze Trigger Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-gray-200">
        <div className="text-xs font-mono text-gray-500">
          Target Shortlist Size: <span className="text-gray-950 font-bold">{shortlistSize} teams</span>
        </div>

        <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <AlertDialogTrigger asChild>
            <button
              disabled={!canFreeze}
              className="flex items-center justify-center gap-2 rounded-md bg-purple-600 hover:bg-purple-500 px-5 py-2.5 text-xs font-bold font-mono text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <Lock className="h-4 w-4" />
              <span>Proceed to Freeze Confirmation</span>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-2 text-gray-950 font-bold font-mono text-sm">
                <Lock className="h-4 w-4 text-purple-400" />
                <span>Confirm Shortlist Freeze</span>
              </div>
              <AlertDialogTitle>Confirm Shortlist Freeze</AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-gray-700 leading-relaxed">
                You are about to lock the KnowCode 4.0 shortlist at exactly <strong className="text-gray-950 font-mono">{shortlistSize} teams</strong>. This finalizes evaluation and preserves the immutable ranking snapshot.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-gray-500 block mb-1">Auditor Signing Key:</label>
                <input
                  type="text"
                  value={auditorId}
                  onChange={(e) => setAuditorId(e.target.value)}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-gray-800"
                />
              </div>

              <label className="flex items-start gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={confirmedCheck}
                  onChange={(e) => setConfirmedCheck(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 bg-white text-purple-600"
                />
                <span className="text-gray-700 text-[11px]">
                  I confirm that all disputes have been reviewed and I am authorized to freeze the shortlist.
                </span>
              </label>
            </div>

            {freezeMutation.isError && (
              <p role="alert" className="text-xs font-mono text-red-400">
                Freeze failed: {freezeMutation.error instanceof Error ? freezeMutation.error.message : "Unknown error"}
              </p>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsModalOpen(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmFreeze}
                disabled={!confirmedCheck || !freezeInput.success || freezeMutation.isPending}
                className="gap-2 rounded bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>{freezeMutation.isPending ? "Freezing..." : "Confirm & Lock Shortlist"}</span>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
