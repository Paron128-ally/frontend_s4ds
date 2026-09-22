"use client";

import React from "react";
import { formatScore, cn } from "@/lib/utils";

interface CompositeScoreProps {
  score?: number;
  maxScore?: number;
  size?: "sm" | "md" | "lg";
  label?: string;
  variant?: "p1" | "p2" | "neutral";
}

export default function CompositeScore({
  score,
  maxScore = 10,
  size = "md",
  label,
  variant = "neutral",
}: CompositeScoreProps) {
  const isAvailable = score !== undefined && score !== null;

  const colorStyle = {
    p1: "text-blue-700",
    p2: "text-brand-700",
    neutral: "text-brand-900",
  }[variant];

  const sizeStyle = {
    sm: "text-xs font-bold",
    md: "text-sm font-bold",
    lg: "text-2xl font-extrabold",
  }[size];

  if (!isAvailable) {
    return <span className="text-brand-300 text-xs">—</span>;
  }

  return (
    <div className="inline-flex items-baseline gap-1">
      {label && <span className="text-[10px] text-brand-400 uppercase mr-1">{label}</span>}
      <span className={cn(sizeStyle, colorStyle)}>{formatScore(score)}</span>
      {size !== "sm" && <span className="text-[10px] text-brand-400">/{maxScore}</span>}
    </div>
  );
}
