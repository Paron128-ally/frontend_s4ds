"use client";

import React from "react";
import Link from "next/link";
import { GitFork, ArrowRight, Activity, Layers, RotateCw } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import PipelineFlow from "@/components/pipeline/PipelineFlow";
import { useRun } from "@/hooks/useRuns";
import { usePass1Stats, usePass2Stats } from "@/hooks/useScores";

export default function PipelinePage() {
  const { data: run, isLoading } = useRun();
  const { data: pass1Stats } = usePass1Stats();
  const { data: pass2Stats } = usePass2Stats();

  if (isLoading || !run) {
    return (
      <PageContainer title="Pipeline DAG Monitor" description="Loading graph topology...">
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-2 font-mono text-xs text-gray-500">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
            <span>Building interactive pipeline graph...</span>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Live Agentic Pipeline DAG"
      description="Real-time DAG visualization of the staged shortlisting architecture. Displays async worker allocation, queue depths, and node convergence states."
      badge={
        <span className="rounded bg-teal-950/70 px-2.5 py-0.5 text-xs font-mono text-teal-300 border border-teal-800/60 font-bold">
          React Flow • 13 Pipeline Stages
        </span>
      }
      actions={
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 rounded border border-gray-300 bg-gray-50 hover:bg-gray-600 px-3 py-1.5 text-xs font-mono text-gray-800 transition-colors"
        >
          <span>Operations Dashboard</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      <div className="space-y-4">
        {/* Graph Card */}
        <PipelineFlow run={run} pass1Stats={pass1Stats} pass2Stats={pass2Stats} />

        {/* Legend / Help Box */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 font-mono text-xs text-gray-500 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="text-gray-800 font-bold">Staged Funnel Rule:</span>
            <span>Pass-1 scores 100% of complete teams. Pass-2 runs only for promoted teams (~60%).</span>
          </div>
          <div className="text-[11px] text-gray-400">
            Scroll to zoom • Click and drag canvas to pan • Click nodes to inspect stage telemetry
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
