"use client";

import PageContainer from "@/components/layout/PageContainer";
import { PASS2_ENABLED } from "@/config/demo";

export default function ShortlistPage() {
  return (
    <PageContainer title="Pass-2 Candidates" description="Pass-2 candidate results are shown only after the backend reports that Pass-2 has run.">
      {!PASS2_ENABLED ? (
        <div className="rounded-lg border border-brand-200 bg-white p-12 text-center">
          <h2 className="text-base font-semibold text-brand-900">Pass-2 has not run for this event</h2>
        </div>
      ) : (
        <div className="rounded-lg border border-brand-200 bg-white p-12 text-center text-sm text-brand-500">No Pass-2 candidate data is available.</div>
      )}
    </PageContainer>
  );
}