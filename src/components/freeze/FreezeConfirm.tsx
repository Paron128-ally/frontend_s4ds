"use client";

import React, { useState } from "react";
import { Lock, AlertTriangle, CheckCircle2, Download } from "lucide-react";
import { useFreezeStatus, useFreezeShortlist } from "@/hooks/useRuns";
import { usePass1Stats } from "@/hooks/useScores";
import { useTeams } from "@/hooks/useTeams";
import { downloadPass2ScoresCsv } from "@/lib/team-scores-csv";
import { useUIStore } from "@/store/uiStore";
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
  const { data: freezeData } = useFreezeStatus();
  const freezeMutation = useFreezeShortlist();
  const { data: pass1Stats } = usePass1Stats();
  const { data: teamsData } = useTeams({ sortBy: "rank", sortOrder: "asc" });
  const teams = teamsData?.teams ?? [];
  const shortlisted = teams.filter((team) => team.finalRank != null);
  const rejected = teams.filter((team) => team.pass1?.band === "REJECT");
  const { userRole } = useUIStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [auditorId, setAuditorId] = useState("");
  const [confirmedCheck, setConfirmedCheck] = useState(false);

  const isFrozen = freezeData?.isFrozen;
  const summary = freezeData?.summary;

  const canFreeze = userRole === "auditor" || userRole === "admin";

  const freezeInput = freezeSchema.safeParse({ shortlistSize, auditorId });

  const handleConfirmFreeze = () => {
    if (!canFreeze || !freezeInput.success) return;
    freezeMutation.mutate(freezeInput.data, { onSuccess: () => setIsModalOpen(false) });
  };

  if (isFrozen && summary) {
    return (
      <div className="space-y-5 rounded-lg border border-brand-200 bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-brand-800 p-2.5 text-white">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-brand-950">
                  Shortlist frozen
                </h3>
                <span className="rounded bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-800">
                  Sealed
                </span>
              </div>
              <p className="mt-1 text-xs text-brand-500">
                Snapshot {summary.snapshotId} · Frozen by {summary.frozenBy}
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-brand-500">
            <div>Frozen at</div>
            <div className="font-semibold text-brand-950">{new Date(summary.frozenAt).toLocaleString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="rounded-lg border border-brand-100 bg-brand-50 p-3.5">
            <span className="mb-1 block text-brand-500">Final shortlist</span>
            <span className="text-xl font-bold text-brand-800">{summary.shortlistCount} teams</span>
            <span className="mt-1 block text-[10px] text-brand-500">Ranked #1 to #{summary.shortlistCount}</span>
          </div>

          <div className="rounded-lg border border-brand-100 bg-brand-50 p-3.5">
            <span className="mb-1 block text-brand-500">Reject list</span>
            <span className="text-xl font-bold text-brand-800">{summary.rejectedCount} teams</span>
            <span className="mt-1 block text-[10px] text-brand-500">Rejected in Round 1 or Round 2</span>
          </div>

          <div className="rounded-lg border border-brand-100 bg-brand-50 p-3.5">
            <span className="mb-1 block text-brand-500">Overrides</span>
            <span className="text-xl font-bold text-brand-800">{summary.overridesApplied}</span>
            <span className="mt-1 block text-[10px] text-brand-500">Sealed with notes</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => downloadPass2ScoresCsv(shortlisted)}
            disabled={shortlisted.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-white px-3.5 py-2 text-xs font-semibold text-brand-800 hover:bg-brand-50 disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            Export shortlist CSV ({shortlisted.length || summary.shortlistCount})
          </button>
          <button
            type="button"
            onClick={() => downloadPass2ScoresCsv(rejected)}
            disabled={rejected.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-white px-3.5 py-2 text-xs font-semibold text-brand-800 hover:bg-brand-50 disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            Export reject list CSV ({rejected.length || summary.rejectedCount})
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-lg border border-brand-200 bg-white p-6">
      {/* Ready Checklist */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-700">
          Pre-freeze checklist
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 rounded-lg border border-brand-100 bg-brand-50 p-2.5 text-brand-800">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-700" />
            <span>All promoted teams evaluated across 3 specialist streams</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-brand-100 bg-brand-50 p-2.5 text-brand-800">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-700" />
            <span>Auditor overrides signed with written justifications</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-brand-100 bg-brand-50 p-2.5 text-brand-800">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-700" />
            <span>Deterministic composite rankings generated (#1 to #{shortlistSize})</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-brand-100 bg-brand-50 p-2.5 text-brand-800">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-700" />
            <span>Formal reject list compiled ({pass1Stats ? pass1Stats.bands.reject : "—"} teams)</span>
          </div>
        </div>
      </div>

      {/* Irreversible Warning Box */}
      <div className="space-y-2 rounded-lg border border-brand-200 bg-brand-50 p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-800">
          <AlertTriangle className="h-4 w-4" />
          <span>Freeze locks this ranking</span>
        </div>
        <ul className="list-disc space-y-1 pl-5 text-xs text-brand-700">
          <li>Rankings become immutable across all organizer & auditor interfaces.</li>
          <li>A permanent cryptographic snapshot will be saved to the database.</li>
          <li>The reject list will be sealed and exported for notification delivery.</li>
          <li>Any subsequent adjustments will require multi-sig administrative intervention.</li>
        </ul>
      </div>

      {/* Freeze Trigger Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-brand-100 pt-2">
        <div className="text-xs text-brand-500">
          Target shortlist size: <span className="font-bold text-brand-950">{shortlistSize} teams</span>
        </div>

        <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <AlertDialogTrigger asChild>
            <button
              disabled={!canFreeze}
              className="flex items-center justify-center gap-2 rounded-lg bg-brand-800 px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Lock className="h-4 w-4" />
              <span>Proceed to Freeze Confirmation</span>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-2 text-sm font-bold text-brand-950">
                <Lock className="h-4 w-4 text-brand-700" />
                <span>Confirm Shortlist Freeze</span>
              </div>
              <AlertDialogTitle>Confirm Shortlist Freeze</AlertDialogTitle>
              <AlertDialogDescription className="text-xs leading-relaxed text-brand-700">
                You are about to lock the KnowCode 4.0 shortlist at exactly <strong className="font-semibold text-brand-950">{shortlistSize} teams</strong>. This finalizes evaluation and preserves the ranking snapshot.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="mb-1 block text-brand-500">Auditor signing key</label>
                <input
                  type="text"
                  value={auditorId}
                  onChange={(e) => setAuditorId(e.target.value)}
                  className="w-full rounded border border-brand-200 bg-white px-3 py-1.5 text-brand-900"
                />
              </div>

              <label className="flex items-start gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={confirmedCheck}
                  onChange={(e) => setConfirmedCheck(e.target.checked)}
                  className="mt-0.5 rounded border-brand-300 text-brand-800"
                />
                <span className="text-[11px] text-brand-700">
                  I confirm that all disputes have been reviewed and I am authorized to freeze the shortlist.
                </span>
              </label>
            </div>

            {freezeMutation.isError && (
              <p role="alert" className="text-xs text-brand-800">
                Freeze failed: {freezeMutation.error instanceof Error ? freezeMutation.error.message : "Unknown error"}
              </p>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsModalOpen(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmFreeze}
                disabled={!confirmedCheck || !freezeInput.success || freezeMutation.isPending}
                className="gap-2 rounded bg-brand-800 text-white hover:bg-brand-700 disabled:opacity-40"
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
