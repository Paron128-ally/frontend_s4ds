"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import { PASS2_ENABLED } from "@/config/demo";
import { useRunHref } from "@/hooks/useRunHref";
import { useTeams } from "@/hooks/useTeams";
import { downloadPass2ScoresCsv } from "@/lib/team-scores-csv";
import { formatScore } from "@/lib/utils";

export default function Pass2Page() {
  const teamBase = useRunHref("team");
  const { data, isLoading, isError } = useTeams({ sortBy: "rank", sortOrder: "asc" });
  const teams = data?.teams ?? [];
  const scored = teams.filter((team) => team.pass2Score != null || team.finalRank != null);

  if (!PASS2_ENABLED) {
    const eligible = teams.filter(
      (team) => team.pass1?.band === "FAST_TRACK" || team.pass1?.band === "BORDERLINE",
    );
    return (
      <PageContainer title="Round 2" description="Deep review of promoted teams.">
        <div className="rounded-lg border border-brand-200 bg-white p-12 text-center">
          <h2 className="text-base font-semibold text-brand-900">Round 2 has not run for this event</h2>
          <p className="mt-2 text-sm text-brand-500">
            {isLoading ? "Eligibility is loading." : `${eligible.length} eligible`}
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Round 2" description="Judge scores for teams promoted after Round 1.">
      {isLoading && (
        <div className="rounded-lg border border-brand-200 bg-white p-10 text-center text-sm text-brand-500">
          Loading Round 2 results...
        </div>
      )}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Unable to load Round 2 results.
        </div>
      )}
      {!isLoading && !isError && scored.length === 0 && (
        <div className="rounded-lg border border-brand-200 bg-white p-12 text-center text-sm text-brand-600">
          No Round 2 scores yet. They appear here as each promoted team finishes.
        </div>
      )}
      {!isLoading && !isError && scored.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-brand-200 bg-white">
          <div className="flex items-center justify-end border-b border-brand-100 px-5 py-3">
            <button
              type="button"
              onClick={() => downloadPass2ScoresCsv(scored)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-800 hover:bg-brand-50"
            >
              <Download className="h-3.5 w-3.5" />
              Download CSV
            </button>
          </div>
          <div className="overflow-x-auto">
          <table className="ops-table w-full">
            <thead>
              <tr>
                <th className="text-left">Rank</th>
                <th className="text-left">Code</th>
                <th className="text-left">Team</th>
                <th className="text-right">Round 1</th>
                <th className="text-left">Band</th>
                <th className="text-right">Final</th>
                <th className="text-left">Explanation</th>
              </tr>
            </thead>
            <tbody>
              {scored.map((team) => (
                <tr key={team.id}>
                  <td className="font-mono text-xs">{team.finalRank ?? "—"}</td>
                  <td className="font-mono text-xs text-brand-500">{team.id}</td>
                  <td>
                    <Link
                      href={`${teamBase}/${encodeURIComponent(team.id)}`}
                      className="font-semibold text-brand-900 hover:underline"
                    >
                      {team.name !== team.id ? team.name : "—"}
                    </Link>
                  </td>
                  <td className="text-right font-mono text-xs">{formatScore(team.pass1?.composite)}</td>
                  <td className="text-xs">{team.pass1?.band?.replaceAll("_", " ") ?? "—"}</td>
                  <td className="text-right font-mono text-xs font-semibold">{formatScore(team.pass2Score)}</td>
                  <td className="max-w-md text-xs text-brand-700">{team.pass2Verdict?.[0] ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
