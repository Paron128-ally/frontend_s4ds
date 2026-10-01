"use client";

import React from "react";
import Link from "next/link";
import { 
  Play, 
  Pause, 
  RotateCw, 
  ArrowRight, 
  Cpu, 
  Clock, 
  DollarSign, 
  AlertCircle,
  Lock,
  Layers,
  CheckCircle2
} from "lucide-react";
import { RunState } from "@/types";
import { formatCurrency, formatDuration } from "@/lib/utils";
import { useRestartRun } from "@/hooks/useRuns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface RunStatusBannerProps {
  run: RunState;
}

export default function RunStatusBanner({ run }: RunStatusBannerProps) {
  const restartMutation = useRestartRun();
  const isFrozen = run.status === "FROZEN";
  const isRunning = run.status === "RUNNING";

  return (
    <Card className="bento-card p-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left Status & Main Stage Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            {isFrozen ? (
              <Badge variant="secondary" className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800 border border-purple-200">
                <Lock className="h-3.5 w-3.5" />
                STATUS: FROZEN
              </Badge>
            ) : isRunning ? (
              <Badge variant="secondary" className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800 border border-brand-200">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600"></span>
                </span>
                STATUS: RUN ACTIVE
              </Badge>
            ) : (
              <Badge variant="secondary" className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 border border-gray-200">
                STATUS: {run.status}
              </Badge>
            )}

            <span className="text-xs text-brand-500">
              Run ID: <span className="text-brand-900 font-semibold">{run.id}</span>
            </span>

            <Badge variant="outline" className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-700 font-medium border border-blue-200">
              Stage: {run.currentStage}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-brand-700 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-brand-400">Pass-1 Complete:</span>
              <span className="font-bold text-brand-950">
                {run.p1Completed} / {run.completeTeams}
              </span>
              <span className="text-brand-400 text-[10px]">
                ({Math.round((run.p1Completed / run.completeTeams) * 100)}%)
              </span>
            </div>
            <Progress value={Math.round((run.p1Completed / run.completeTeams) * 100)} className="h-2 w-24" />

            <div className="flex items-center gap-1.5">
              <span className="text-brand-400">Pass-2 Deep:</span>
              <span className="font-bold text-brand-950">
                {run.p2Completed} / {run.p2Promoted}
              </span>
              <span className="text-brand-400 text-[10px]">
                ({run.p2Promoted ? Math.round(((run.p2Completed ?? 0) / run.p2Promoted) * 100) : "—"}%)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-brand-500" />
              <span className="text-brand-400">Runtime:</span>
              <span className="font-bold text-brand-900">
                {formatDuration(run.elapsedSeconds)}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-brand-600" />
              <span className="text-brand-400">Estimated Cost:</span>
              <span className="font-bold text-brand-700">
                {formatCurrency(run.estimatedCost)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Quick Operation Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {isFrozen ? (
            <Button
              onClick={() => restartMutation.mutate()}
              disabled={restartMutation.isPending}
              className="flex items-center gap-1.5 rounded-xl bg-brand-800 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700"
            >
              <RotateCw className="h-3.5 w-3.5" />
              Reset & Rerun Pipeline
            </Button>
          ) : (
            <>
              <Link
                href="/pass1"
                className="flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 text-xs font-medium text-brand-800 transition-colors"
              >
                <span>Monitor Pass-1</span>
                <ArrowRight className="h-3 w-3 text-brand-400" />
              </Link>
              <Link
                href="/pass2"
                className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors"
              >
                <Layers className="h-3 w-3" />
                <span>Monitor Pass-2</span>
              </Link>
              <Link
                href="/shortlist"
                className="flex items-center gap-1.5 rounded-xl bg-brand-800 hover:bg-brand-700 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors shadow-sm"
              >
                <span>View Shortlist ({run.shortlistSize})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
