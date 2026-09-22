"use client";

import React from "react";
import { CheckCircle2, AlertCircle, ShieldAlert, GitCommit, Layers, Code } from "lucide-react";
import { SpecialistCritique } from "@/types";

interface VerdictBulletsProps {
  verdict?: string[];
  critique?: SpecialistCritique;
  pass2Score?: number;
}

export default function VerdictBullets({ verdict, critique, pass2Score }: VerdictBulletsProps) {
  if (!critique && !verdict) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-5 text-gray-400 font-mono text-xs">
        Pass-2 deep review has not been synthesized for this candidate team yet.
      </div>
    );
  }

  const themeCritic = critique?.themeCritic;
  const builderCritic = critique?.builderCritic;
  const integrity = critique?.integrityChecker;

  const crowdingColor = {
    LOW: "text-emerald-400 bg-emerald-950/50 border-emerald-800/60",
    MODERATE: "text-amber-400 bg-amber-950/50 border-amber-800/60",
    HIGH: "text-red-400 bg-red-950/50 border-red-800/60",
  }[themeCritic?.crowdingRisk || "LOW"];

  const integrityColor = {
    CLEAR: "text-emerald-400 bg-emerald-950/50 border-emerald-800/60",
    FLAGGED: "text-red-400 bg-red-950/50 border-red-800/60 animate-pulse",
    UNDER_REVIEW: "text-amber-400 bg-amber-950/50 border-amber-800/60",
  }[integrity?.status || "CLEAR"];

  return (
    <div className="space-y-6">
      {/* 3 Specialist Review Streams */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Theme Critic */}
        {themeCritic && (
          <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-purple-400" />
                <h4 className="text-xs font-mono font-bold uppercase text-gray-800">
                  Theme Critic
                </h4>
              </div>
              <span className={`rounded border px-2 py-0.5 text-[10px] font-mono font-bold ${crowdingColor}`}>
                RISK: {themeCritic.crowdingRisk}
              </span>
            </div>

            <div className="text-xs font-mono text-gray-700">
              Taxonomy: <span className="text-gray-950 font-bold">{themeCritic.clusterName}</span>
            </div>

            <ul className="space-y-2 text-xs text-gray-500">
              {themeCritic.notes.map((note, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 2. Builder Critic */}
        {builderCritic && (
          <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Code className="h-4 w-4 text-blue-400" />
                <h4 className="text-xs font-mono font-bold uppercase text-gray-800">
                  Builder Critic
                </h4>
              </div>
              <span className="rounded border border-blue-800/60 bg-blue-950/50 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-300">
                SIGNAL: {builderCritic.buildSignalScore} / 10
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="rounded bg-white/60 p-2 border border-gray-200/60">
                <span className="text-gray-400 block">Recent Commits:</span>
                <span className="font-bold text-gray-800">{builderCritic.commitCountRecent} commits</span>
              </div>
              <div className="rounded bg-white/60 p-2 border border-gray-200/60">
                <span className="text-gray-400 block">README Quality:</span>
                <span className="font-bold text-gray-800">{builderCritic.readmeQuality}</span>
              </div>
            </div>

            <ul className="space-y-2 text-xs text-gray-500">
              {builderCritic.notes.map((note, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 3. Integrity Checker */}
        {integrity && (
          <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-emerald-400" />
                <h4 className="text-xs font-mono font-bold uppercase text-gray-800">
                  Integrity Checker
                </h4>
              </div>
              <span className={`rounded border px-2 py-0.5 text-[10px] font-mono font-bold ${integrityColor}`}>
                {integrity.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="rounded bg-white/60 p-2 border border-gray-200/60">
                <span className="text-gray-400 block">Duplicate Idea:</span>
                <span className={integrity.duplicateIdea ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                  {integrity.duplicateIdea ? "YES (FLAG)" : "NO"}
                </span>
              </div>
              <div className="rounded bg-white/60 p-2 border border-gray-200/60">
                <span className="text-gray-400 block">Resume Reuse:</span>
                <span className={integrity.resumeReuse ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                  {integrity.resumeReuse ? "YES (FLAG)" : "NO"}
                </span>
              </div>
            </div>

            {integrity.similarTeams && integrity.similarTeams.length > 0 && (
              <div className="text-[11px] font-mono text-gray-500 rounded bg-white/40 p-2 border border-gray-200/50">
                <span className="text-gray-400">Nearest Vector Match: </span>
                <span className="text-blue-400 font-bold">{integrity.similarTeams[0].teamId}</span>{" "}
                (Similarity: {integrity.similarTeams[0].similarity})
              </div>
            )}

            <ul className="space-y-2 text-xs text-gray-500">
              {integrity.notes.map((note, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Judge Synthesizer & Consensus Output */}
      {verdict && (
        <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-800">
                Judge Synthesizer AI Consensus Verdict
              </h4>
            </div>
            {pass2Score !== undefined && (
              <span className="rounded bg-emerald-950 px-2.5 py-1 text-xs font-mono font-bold text-emerald-300 border border-emerald-700">
                Pass-2 Final Score: {pass2Score} / 10
              </span>
            )}
          </div>

          <div className="space-y-2 pt-1">
            {verdict.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-700 font-sans">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <p className="leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
