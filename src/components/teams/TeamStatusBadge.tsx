"use client";

import React from "react";
import { TeamStatus, Pass1Band } from "@/types";
import { cn } from "@/lib/utils";

interface TeamStatusBadgeProps {
  status: TeamStatus;
  band?: Pass1Band;
  className?: string;
}

export default function TeamStatusBadge({ status, band, className }: TeamStatusBadgeProps) {
  const getStyle = () => {
    switch (status) {
      case "SHORTLIST":
        return "bg-emerald-950/80 text-emerald-300 border-emerald-700/80 font-bold";
      case "OVERRIDE":
        return "bg-purple-950/80 text-purple-300 border-purple-700/80 font-bold animate-pulse";
      case "P2_DONE":
        return "bg-indigo-950/70 text-indigo-300 border-indigo-800/60";
      case "P2_QUEUED":
        return "bg-indigo-950/40 text-indigo-400 border-indigo-900/50";
      case "P1_DONE":
        return "bg-blue-950/70 text-blue-300 border-blue-800/60";
      case "P1_QUEUED":
        return "bg-gray-50/80 text-gray-500 border-gray-300/50";
      case "REJECT":
        return "bg-red-950/70 text-red-400 border-red-800/60 line-through opacity-85";
      case "INCOMPLETE":
        return "bg-amber-950/80 text-amber-400 border-amber-800/70 font-bold";
      default:
        return "bg-gray-50 text-gray-700 border-gray-300";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-mono tracking-wide uppercase",
        getStyle(),
        className
      )}
    >
      {status === "SHORTLIST" && "★ "}
      {status}
    </span>
  );
}
