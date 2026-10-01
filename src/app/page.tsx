"use client";

import Link from "next/link";
import { Plus, ArrowRight, Loader2 } from "lucide-react";
import { useRunsList } from "@/hooks/useRuns";
import { runPath } from "@/lib/run-path";
import { cn } from "@/lib/utils";

export default function RunsHomePage() {
  const { data, isLoading, isError } = useRunsList();
  const runs = data?.data ?? [];

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-950">Scoring runs</h1>
          <p className="mt-1 text-sm text-brand-600">Pick a run or start a new cohort with a name and registration CSV.</p>
        </div>
        <Link
          href="/create"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-800 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-900"
        >
          <Plus className="h-4 w-4" />
          New run
        </Link>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-brand-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading runs...
        </div>
      )}
      {isError && <p className="text-sm text-red-700">Could not load runs from the backend.</p>}
      {!isLoading && !isError && runs.length === 0 && (
        <div className="rounded-xl border border-brand-200 bg-white p-10 text-center text-sm text-brand-600">
          No runs yet.{" "}
          <Link href="/create" className="font-semibold text-brand-800 hover:underline">
            Create the first run
          </Link>
        </div>
      )}
      <ul className="space-y-2">
        {runs.map((run) => (
          <li key={run.run_id}>
            <Link
              href={runPath(run.run_id, "dashboard")}
              className="flex items-center justify-between gap-4 rounded-xl border border-brand-200 bg-white px-4 py-3 hover:border-brand-400 hover:shadow-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-brand-900">{run.name || "Untitled run"}</p>
                <p className="font-mono text-[11px] text-brand-500">{run.run_id}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3 text-xs text-brand-600">
                <span className={cn("rounded-full px-2 py-0.5 font-medium uppercase", run.status === "frozen" ? "bg-brand-100" : "bg-green-50 text-green-800")}>
                  {run.status.replaceAll("_", " ")}
                </span>
                <span>{run.total_teams} teams</span>
                <ArrowRight className="h-4 w-4 text-brand-400" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
