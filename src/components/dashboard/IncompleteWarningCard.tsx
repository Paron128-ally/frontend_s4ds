"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, ShieldAlert, FileX2 } from "lucide-react";

interface IncompleteWarningCardProps {
  count: number;
}

export default function IncompleteWarningCard({ count }: IncompleteWarningCardProps) {
  if (count <= 0) return null;

  return (
    <div className="bento-card border-amber-200 bg-amber-50/50 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-amber-100 p-2 border border-amber-200 text-amber-600 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-amber-800">
                {count} Incomplete Registrations Detected
              </h4>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
                EXCLUDED FROM RANKING
              </span>
            </div>
            <p className="text-xs text-amber-700/80 mt-1 max-w-2xl leading-relaxed">
              These candidate teams are strictly excluded from Pass-1 scoring and shortlist ranking because mandatory registration data (repository link, architecture scope, or member roster) was missing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/ingest"
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-800 transition-colors"
          >
            <span>View Incomplete Teams</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
