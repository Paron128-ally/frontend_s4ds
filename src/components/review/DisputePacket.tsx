"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, CheckCircle2, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { DisputeItem, Team } from "@/types";
import OverrideForm from "../freeze/OverrideForm";
import { useTeam } from "@/hooks/useTeams";

interface DisputePacketProps {
  dispute: DisputeItem;
}

export default function DisputePacket({ dispute }: DisputePacketProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: team } = useTeam(dispute.teamId);

  const isResolved = dispute.status === "RESOLVED";

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-amber-950/60 text-amber-400 border border-amber-800/60 font-mono font-bold text-xs">
            !
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-blue-400 text-sm">{dispute.teamId}</span>
              <span className="text-sm font-semibold text-gray-950">{dispute.teamName}</span>
              <span className="rounded bg-gray-50 px-2 py-0.5 text-[10px] font-mono text-gray-500">
                {dispute.band}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{dispute.projectTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right font-mono">
            <span className="text-gray-400 text-[10px] block">CURRENT SCORE</span>
            <span className="text-gray-950 font-bold text-sm">{dispute.currentScore} / 10</span>
          </div>

          <span
            className={`rounded px-2.5 py-1 text-xs font-mono font-bold border ${
              isResolved
                ? "bg-emerald-950/70 text-emerald-300 border-emerald-800"
                : "bg-amber-950/70 text-amber-300 border-amber-800 animate-pulse"
            }`}
          >
            {dispute.status}
          </span>
        </div>
      </div>

      {/* Trigger Reason */}
      <div className="rounded bg-white/60 p-3 border border-gray-200/80 text-xs font-mono space-y-1">
        <span className="text-amber-400 font-bold block">Review Reason:</span>
        <p className="text-gray-700 leading-relaxed font-sans">{dispute.reason}</p>
      </div>

      {/* AI Verdict Summary */}
      <div className="rounded bg-white/40 p-3 border border-gray-200/50 text-xs font-mono space-y-1">
        <span className="text-gray-400 block">AI Verdict Summary:</span>
        <p className="text-gray-500 leading-relaxed font-sans">{dispute.aiVerdictSummary}</p>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-1">
        <Link
          href={`/team/${dispute.teamId}`}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-blue-400 hover:text-blue-300"
        >
          <span>Open Full Team Dossier</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs font-mono text-gray-700 hover:text-gray-950 rounded border border-gray-300 bg-gray-50 px-3 py-1.5"
        >
          <span>{isExpanded ? "Hide Override Panel" : "Auditor Override"}</span>
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Expandable Override Form */}
      {isExpanded && team && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <OverrideForm team={team} onSuccess={() => setIsExpanded(false)} />
        </div>
      )}
    </div>
  );
}
