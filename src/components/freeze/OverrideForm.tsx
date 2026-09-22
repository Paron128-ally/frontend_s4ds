"use client";

import React, { useState } from "react";
import { ShieldCheck, AlertTriangle, CheckCircle2, Lock } from "lucide-react";
import { Team } from "@/types";
import { useApplyOverride } from "@/hooks/useTeams";
import { useUIStore } from "@/store/uiStore";
import { overrideFormSchema } from "@/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface OverrideFormProps {
  team: Team;
  onSuccess?: () => void;
}

export default function OverrideForm({ team, onSuccess }: OverrideFormProps) {
  const { userRole } = useUIStore();
  const applyOverrideMutation = useApplyOverride();

  const currentScore = team.overrideScore !== undefined
    ? team.overrideScore
    : team.pass2Score !== undefined
    ? team.pass2Score
    : team.pass1?.composite;
  const [overrideScore, setOverrideScore] = useState<string>(
    currentScore !== undefined ? currentScore.toString() : ""
  );
  const [auditorNote, setAuditorNote] = useState<string>("");
  const [auditorId, setAuditorId] = useState<string>("auditor-jane-doe");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const canOverride = userRole === "auditor" || userRole === "admin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!canOverride) {
      setErrorMsg("Permission Denied: Only users with 'auditor' or 'admin' roles can apply overrides.");
      return;
    }

    const parsed = overrideFormSchema.safeParse({ overrideScore, auditorNote, auditorId });
    if (!parsed.success) {
      setErrorMsg(parsed.error.issues[0].message);
      return;
    }

    try {
      await applyOverrideMutation.mutateAsync({ teamId: team.id, ...parsed.data });
      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMsg(err instanceof Error && err.message ? err.message : "Failed to apply override");
    }
  };

  return (
    <Card className="p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-purple-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-800">
            Auditor Human-Gate Override Form
          </h3>
        </div>
        {!canOverride && (
          <Badge variant="destructive" className="flex items-center gap-1 rounded bg-red-950/60 px-2 py-0.5 text-[10px] font-mono text-red-400 border border-red-800">
            <Lock className="h-3 w-3" />
            READ-ONLY FOR {userRole.toUpperCase()}
          </Badge>
        )}
      </div>

      {isSuccess && (
        <div className="rounded-md bg-emerald-950/80 p-3 border border-emerald-700 text-emerald-200 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Override successfully recorded in audit trail. Shortlist rank will reflect updated composite.</span>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-md bg-red-950/80 p-3 border border-red-800 text-red-200 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Current Score */}
          <div>
            <label className="text-gray-500 block mb-1">Current Active Score:</label>
            <div className="rounded border border-gray-300 bg-white/60 px-3 py-2 text-gray-950 font-bold">
              {team.overrideScore !== undefined ? (
                <span className="text-purple-300">{team.overrideScore} (Overridden)</span>
              ) : (
                <span>{team.pass2Score ?? team.pass1?.composite ?? "—"} / 10</span>
              )}
            </div>
          </div>

          {/* Proposed Override Score */}
          <div>
            <label className="text-gray-700 font-bold block mb-1">
              New Override Score (0.0 - 10.0): <span className="text-red-400">*</span>
            </label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="10"
              disabled={!canOverride || applyOverrideMutation.isPending}
              value={overrideScore}
              onChange={(e) => setOverrideScore(e.target.value)}
              className="w-full border-purple-600/50 bg-white px-3 py-2 text-gray-950 font-bold focus:border-purple-500 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Auditor Identifier */}
        <div>
          <label className="text-gray-500 block mb-1">
            Auditor Identity: <span className="text-red-400">*</span>
          </label>
          <Input
            type="text"
            disabled={!canOverride || applyOverrideMutation.isPending}
            value={auditorId}
            onChange={(e) => setAuditorId(e.target.value)}
            className="w-full border-gray-300 bg-white px-3 py-1.5 text-gray-800 focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        {/* Written Justification Note */}
        <div>
          <label className="text-gray-700 font-bold block mb-1">
            Written Auditor Justification: <span className="text-red-400">*</span>
          </label>
          <textarea
            rows={3}
            disabled={!canOverride || applyOverrideMutation.isPending}
            value={auditorNote}
            onChange={(e) => setAuditorNote(e.target.value)}
            placeholder="Explain why the score should be changed (e.g., reviewed git commit history, validated exceptional resilience in edge cases)..."
            className="w-full rounded border border-gray-300 bg-white p-2.5 text-gray-800 placeholder:text-gray-500 focus:border-purple-500 focus:outline-none disabled:opacity-50"
          />
          <span className="text-[10px] text-gray-400 block mt-1">
            Required by Hackathon Governance Rules. This note will be permanently sealed in the frozen audit snapshot.
          </span>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={!canOverride || applyOverrideMutation.isPending}
            className="flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500 disabled:opacity-40"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>{applyOverrideMutation.isPending ? "Recording Override..." : "Apply Auditor Override"}</span>
          </Button>
        </div>
      </form>
    </Card>
  );
}
