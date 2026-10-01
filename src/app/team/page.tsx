"use client";

import Link from "next/link";
import { ArrowUpRight, Users } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import { useTeams } from "@/hooks/useTeams";
import { formatScore } from "@/lib/utils";

export default function TeamsPage() {
  const { data, isLoading, isError } = useTeams({});
  const teams = data?.teams ?? [];

  return (
    <PageContainer title="Teams" description="Teams and Pass-1 results returned by the evaluation API.">
      {isLoading && <div className="rounded-lg border border-brand-200 bg-white p-10 text-center text-sm text-brand-500">Loading teams...</div>}
      {isError && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">Unable to load teams from the backend.</div>}
      {!isLoading && !isError && teams.length === 0 && <div className="rounded-lg border border-brand-200 bg-white p-12 text-center"><Users className="mx-auto h-8 w-8 text-brand-300" /><p className="mt-2 text-sm text-brand-700">No teams returned by the backend.</p></div>}
      {!isLoading && !isError && teams.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-brand-200 bg-white">
          <table className="ops-table w-full">
            <thead><tr><th className="text-left">Team ID</th><th className="text-left">Name</th><th className="text-left">Track</th><th className="text-right">Pass-1 Score</th><th className="text-left">Band</th><th /></tr></thead>
            <tbody>{teams.map((team) => <tr key={team.id}>
              <td className="font-mono text-xs text-brand-500">{team.id}</td>
              <td className="font-semibold text-brand-900">{team.name}</td>
              <td className="text-xs text-brand-600">{team.track.replace("_", " ")}</td>
              <td className="text-right font-mono text-xs">{formatScore(team.pass1?.composite)}</td>
              <td className="text-xs">{team.pass1?.band?.replace("_", " ") ?? "—"}</td>
              <td className="text-right"><Link href={`/team/${encodeURIComponent(team.id)}`} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-950">Dossier <ArrowUpRight className="h-3 w-3" /></Link></td>
            </tr>)}</tbody>
          </table>
        </div>
      )}
    </PageContainer>
  );
}