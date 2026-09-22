"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, 
  ExternalLink, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  GitBranch,
  Calendar,
  Layers,
  Award
} from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import ScoreBreakdown from "@/components/scores/ScoreBreakdown";
import VerdictBullets from "@/components/review/VerdictBullets";
import EvidenceLinks from "@/components/review/EvidenceLinks";
import OverrideForm from "@/components/freeze/OverrideForm";
import TeamStatusBadge from "@/components/teams/TeamStatusBadge";
import { useTeam } from "@/hooks/useTeams";
import { useUIStore } from "@/store/uiStore";

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = params.id as string;
  const { data: team, isLoading } = useTeam(teamId);
  const { userRole } = useUIStore();

  if (isLoading) {
    return (
      <PageContainer title="Candidate Dossier" description="Loading team profile...">
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-2 font-mono text-xs text-gray-500">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            <span>Loading evaluation packet for {teamId}...</span>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!team) {
    return (
      <PageContainer title="Team Not Found" description="The requested team identifier does not exist.">
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center space-y-4">
          <p className="text-sm font-mono text-gray-500">No registration found with ID: {teamId}</p>
          <Link
            href="/shortlist"
            className="inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-xs font-mono text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Shortlist Table</span>
          </Link>
        </div>
      </PageContainer>
    );
  }

  const isIncomplete = team.status === "INCOMPLETE";
  const hasIntegrityFlags = team.integrityFlags && team.integrityFlags.length > 0;
  const isOverridden = team.overrideScore !== undefined || team.status === "OVERRIDE";

  return (
    <PageContainer
      title={`Candidate Dossier: ${team.name}`}
      description={`Authoritative evaluation packet and evidence trace for ${team.id}.`}
      badge={<TeamStatusBadge status={team.status} band={team.pass1?.band} />}
      actions={
        <Link
          href="/shortlist"
          className="flex items-center gap-1.5 rounded border border-gray-300 bg-gray-50 hover:bg-gray-600 px-3 py-1.5 text-xs font-mono text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Table</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Team Identification Banner */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold font-mono text-blue-400">{team.id}</span>
                <h2 className="text-xl font-bold font-sans text-gray-950">{team.name}</h2>
                {team.finalRank !== undefined && (
                  <span className="rounded bg-emerald-950 px-2.5 py-0.5 text-xs font-mono font-bold text-emerald-300 border border-emerald-700">
                    SHORTLIST RANK #{team.finalRank}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-700 mt-1 max-w-2xl font-sans leading-relaxed">
                {team.idea}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              <div className="rounded bg-white px-3 py-1.5 border border-gray-200">
                <span className="text-gray-400 block text-[10px]">EVALUATION TRACK</span>
                <span className="font-bold text-gray-800 capitalize">
                  {team.track.replace("_", " ")}
                </span>
              </div>

              {team.pass2Score !== undefined && (
                <div className="rounded bg-white px-3 py-1.5 border border-gray-200">
                  <span className="text-gray-400 block text-[10px]">PASS-2 SCORE</span>
                  <span className="font-bold text-emerald-400">{team.pass2Score} / 10</span>
                </div>
              )}
            </div>
          </div>

          {/* Incomplete / Flagged Notice */}
          {isIncomplete && (
            <div className="rounded-md bg-amber-950/40 p-3 border border-amber-800/60 text-amber-200 text-xs font-mono space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <AlertTriangle className="h-4 w-4" />
                <span>MANDATORY EXCLUSION: INCOMPLETE REGISTRATION</span>
              </div>
              <ul className="list-disc pl-5 text-[11px] text-amber-200/80 space-y-0.5">
                {team.incompleteReasons?.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {hasIntegrityFlags && (
            <div className="rounded-md bg-red-950/40 p-3 border border-red-800/60 text-red-200 text-xs font-mono space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-red-300">
                <ShieldAlert className="h-4 w-4" />
                <span>INTEGRITY FLAGS DETECTED ({team.integrityFlags?.length})</span>
              </div>
              <ul className="list-disc pl-5 text-[11px] text-red-200/80 space-y-0.5">
                {team.integrityFlags?.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Override Notice if present */}
          {isOverridden && (
            <div className="rounded-md bg-purple-950/40 p-3 border border-purple-800/60 text-purple-200 text-xs font-mono space-y-1">
              <div className="flex items-center gap-2 font-bold text-purple-300">
                <Award className="h-4 w-4" />
                <span>HUMAN-GATE AUDITOR OVERRIDE RECORDED</span>
              </div>
              <div className="text-[11px] text-purple-200/90 leading-relaxed font-sans">
                Override Score: <strong>{team.overrideScore} / 10</strong> by{" "}
                <strong>{team.auditorId || "auditor-ops"}</strong>. Note: &quot;{team.auditorNote}&quot;
              </div>
            </div>
          )}
        </div>

        {/* Pass-1 Score Breakdown (Authoritative 5 Dimensions) */}
        {team.pass1 && <ScoreBreakdown score={team.pass1} showReasons={true} />}

        {/* Pass-2 Specialist Review (Theme, Builder, Integrity) & Judge Synthesizer */}
        {team.critique && (
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-gray-500 font-semibold">
              Pass-2 Specialist Stream Review & Synthesis
            </h3>
            <VerdictBullets
              verdict={team.pass2Verdict}
              critique={team.critique}
              pass2Score={team.pass2Score}
            />
          </div>
        )}

        {/* Verified Evidence Links */}
        <EvidenceLinks links={team.evidenceLinks} />

        {/* Human Gate Override Form (Auditor Gate) */}
        {!isIncomplete && <OverrideForm team={team} />}
      </div>
    </PageContainer>
  );
}
