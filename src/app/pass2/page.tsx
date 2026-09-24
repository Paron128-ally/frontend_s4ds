"use client";

import PageContainer from "@/components/layout/PageContainer";
import { PASS2_ENABLED } from "@/config/demo";
import { useTeams } from "@/hooks/useTeams";

export default function Pass2Page() {
  const { data, isLoading, isError } = useTeams({});
  const eligible = (data?.teams ?? []).filter((team) => team.pass1?.band === "FAST_TRACK" || team.pass1?.band === "BORDERLINE");

  return (
    <PageContainer title="Pass-2" description="Pass-2 results are shown only when this build is enabled and the backend supplies them.">
      {!PASS2_ENABLED ? (
        <div className="rounded-lg border border-brand-200 bg-white p-12 text-center">
          <h2 className="text-base font-semibold text-brand-900">Pass-2 has not run for this event</h2>
          <p className="mt-2 text-sm text-brand-500">{isLoading ? "Eligibility is loading." : `${eligible.length} eligible`}</p>
          {isError && <p className="mt-3 text-xs text-red-700">Unable to load Pass-2 eligibility.</p>}
        </div>
      ) : (
        <div className="rounded-lg border border-brand-200 bg-white p-12 text-center text-sm text-brand-500">No Pass-2 results are available.</div>
      )}
    </PageContainer>
  );
}