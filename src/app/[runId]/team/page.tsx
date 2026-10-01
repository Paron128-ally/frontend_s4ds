"use client";

import Link from "next/link";
import { ArrowUpRight, Download, Users } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import TrackSummaryCell from "@/components/teams/TrackSummaryCell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useRunHref } from "@/hooks/useRunHref";
import { useDownloadTeamsExport, useTeams } from "@/hooks/useTeams";
import { formatScore } from "@/lib/utils";

export default function TeamsPage() {
  const teamBase = useRunHref("team");
  const exportMutation = useDownloadTeamsExport();
  const { data, isLoading, isError } = useTeams({ sortBy: "final", sortOrder: "desc" });
  const teams = data?.teams ?? [];

  const handleDownload = async () => {
    try {
      const { csv } = await exportMutation.mutateAsync();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "teams-registration-scores.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      // mutation error surfaced below
    }
  };

  return (
    <PageContainer
      title="Teams"
      description="Registration data from the backend plus Round 1 final, band, and Round 2 final."
    >
      {isLoading && (
        <div className="rounded-lg border border-brand-200 bg-white p-10 text-center text-sm text-brand-500">
          Loading teams...
        </div>
      )}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Unable to load teams from the backend.
        </div>
      )}
      {!isLoading && !isError && teams.length === 0 && (
        <div className="rounded-lg border border-brand-200 bg-white p-12 text-center">
          <Users className="mx-auto h-8 w-8 text-brand-300" />
          <p className="mt-2 text-sm text-brand-700">No teams returned by the backend.</p>
        </div>
      )}
      {!isLoading && !isError && teams.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-brand-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-100 px-5 py-4">
            <p className="text-sm font-semibold text-brand-900">{teams.length} teams</p>
            <button
              type="button"
              onClick={handleDownload}
              disabled={teams.length === 0 || exportMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-800 hover:bg-brand-50 disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              {exportMutation.isPending ? "Building CSV..." : "Download CSV"}
            </button>
          </div>
          {exportMutation.isError && (
            <p className="border-b border-brand-100 px-5 py-2 text-xs text-red-700">
              {exportMutation.error instanceof Error
                ? exportMutation.error.message
                : "Could not download CSV from the backend."}
            </p>
          )}
          <TooltipProvider delayDuration={150}>
          <div className="overflow-x-auto">
            <table className="ops-table w-full">
              <thead>
                <tr>
                  <th className="text-left">Team ID</th>
                  <th className="text-left">Name</th>
                  <th className="text-left">Track</th>
                  <th className="text-right">Round 1</th>
                  <th className="text-left">Round 1 Band</th>
                  <th className="text-right">Final</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr key={team.id}>
                    <td className="font-mono text-xs text-brand-500">{team.id}</td>
                    <td className="font-semibold text-brand-900">
                      {team.name !== team.id ? team.name : "—"}
                    </td>
                    <td>
                      <TrackSummaryCell track={team.track} summary={team.idea} />
                    </td>
                    <td className="text-right font-mono text-xs font-semibold">{formatScore(team.pass1?.composite)}</td>
                    <td className="text-xs">{team.pass1?.band?.replaceAll("_", " ") ?? "—"}</td>
                    <td className="text-right font-mono text-xs font-semibold">{formatScore(team.pass2Score)}</td>
                    <td className="text-right">
                      <Link
                        href={`${teamBase}/${encodeURIComponent(team.id)}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-950"
                      >
                        Dossier <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </TooltipProvider>
        </div>
      )}
    </PageContainer>
  );
}
