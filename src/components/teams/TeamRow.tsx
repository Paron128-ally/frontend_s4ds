"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, AlertTriangle, CheckCircle2, ShieldAlert, GitBranch } from "lucide-react";
import { Team } from "@/types";
import TeamStatusBadge from "./TeamStatusBadge";
import CompositeScore from "../scores/CompositeScore";
import { cn } from "@/lib/utils";

interface TeamRowProps {
  team: Team;
}

export default function TeamRow({ team }: TeamRowProps) {
  const isShortlist = team.status === "SHORTLIST";
  const hasIntegrityFlags = team.integrityFlags && team.integrityFlags.length > 0;
  const isOverridden = team.overrideScore !== undefined || team.status === "OVERRIDE";
  const isIncomplete = team.status === "INCOMPLETE";

  const getBandBadge = () => {
    if (!team.pass1?.band) return null;
    switch (team.pass1.band) {
      case "FAST_TRACK":
        return "text-emerald-400 bg-emerald-950/40 border-emerald-800/40";
      case "BORDERLINE":
        return "text-blue-400 bg-blue-950/40 border-blue-800/40";
      case "REJECT":
        return "text-red-400 bg-red-950/40 border-red-800/40";
    }
  };

  return (
    <tr
      className={cn(
        "border-b border-gray-200/80 transition-colors text-xs font-mono",
        isShortlist
          ? "bg-emerald-950/10 hover:bg-emerald-950/20"
          : isOverridden
          ? "bg-purple-950/10 hover:bg-purple-950/20"
          : isIncomplete
          ? "bg-amber-950/10 hover:bg-amber-950/20 opacity-80"
          : "hover:bg-gray-50/40"
      )}
    >
      {/* Rank */}
      <td className="py-3 px-3 font-mono font-bold">
        {team.finalRank ? (
          <span className="text-emerald-400 font-extrabold">#{team.finalRank}</span>
        ) : isIncomplete ? (
          <span className="text-amber-500 text-[10px]">—</span>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>

      {/* Team ID & Name */}
      <td className="py-3 px-3">
        <div className="flex flex-col">
          <span className="font-bold text-gray-900">{team.name}</span>
          <span className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-0.5">
            <span className="text-blue-400 font-semibold">{team.id}</span>
            <span>•</span>
            <span className="capitalize">{team.track.replace("_", " ")}</span>
          </span>
        </div>
      </td>

      {/* Project & Theme */}
      <td className="py-3 px-3 max-w-[220px]">
        <div className="truncate text-gray-700 font-sans" title={team.idea}>
          {team.theme || team.idea}
        </div>
      </td>

      {/* P1 Score */}
      <td className="py-3 px-3">
        <CompositeScore score={team.pass1?.composite} variant="p1" size="sm" />
      </td>

      {/* P2 Score */}
      <td className="py-3 px-3">
        {isOverridden ? (
          <div className="flex items-center gap-1">
            <CompositeScore score={team.overrideScore} variant="p2" size="sm" />
            <span className="text-[9px] rounded bg-purple-950 px-1 text-purple-300 border border-purple-700">
              OVR
            </span>
          </div>
        ) : (
          <CompositeScore score={team.pass2Score} variant="p2" size="sm" />
        )}
      </td>

      {/* Pass-1 Band */}
      <td className="py-3 px-3">
        {team.pass1?.band ? (
          <span
            className={cn(
              "rounded border px-2 py-0.5 text-[10px] font-semibold",
              getBandBadge()
            )}
          >
            {team.pass1.band.replace("_", " ")}
          </span>
        ) : (
          <span className="text-gray-500 text-[10px]">Unscored</span>
        )}
      </td>

      {/* AI Verdict */}
      <td className="py-3 px-3 max-w-[160px]">
        {isIncomplete ? (
          <span className="text-amber-400 text-[10px]">Excluded (Incomplete)</span>
        ) : team.pass2Verdict ? (
          <span className="text-emerald-300 text-[11px] truncate block" title={team.pass2Verdict[0]}>
            Strong
          </span>
        ) : team.pass1?.band === "REJECT" ? (
          <span className="text-red-400 text-[11px]">Auto-Rejected</span>
        ) : (
          <span className="text-gray-500 text-[11px]">Promoted (P2 Queue)</span>
        )}
      </td>

      {/* Integrity */}
      <td className="py-3 px-3">
        {hasIntegrityFlags ? (
          <span
            className="inline-flex items-center gap-1 rounded bg-red-950/70 px-1.5 py-0.5 text-[10px] text-red-300 border border-red-800"
            title={team.integrityFlags?.join("; ")}
          >
            <ShieldAlert className="h-3 w-3 text-red-400" />
            <span>Flagged ({team.integrityFlags?.length})</span>
          </span>
        ) : isIncomplete ? (
          <span className="text-amber-400 text-[10px] flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Incomplete
          </span>
        ) : (
          <span className="text-gray-400 text-[10px] flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-500/70" />
            Clear
          </span>
        )}
      </td>

      {/* Status Badge */}
      <td className="py-3 px-3">
        <TeamStatusBadge status={team.status} band={team.pass1?.band} />
      </td>

      {/* Action */}
      <td className="py-3 px-3 text-right">
        <Link
          href={`/team/${team.id}`}
          className="inline-flex items-center gap-1 rounded border border-gray-300 bg-gray-50/80 hover:bg-gray-600 px-2.5 py-1 text-[11px] font-sans font-medium text-gray-800 transition-colors"
        >
          <span>View Team</span>
          <ArrowRight className="h-3 w-3 text-gray-500" />
        </Link>
      </td>
    </tr>
  );
}
