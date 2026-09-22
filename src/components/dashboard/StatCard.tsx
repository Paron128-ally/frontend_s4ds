"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    positive?: boolean;
  };
  highlight?: "default" | "blue" | "emerald" | "amber" | "purple";
  onClick?: () => void;
}

export default function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  trend,
  highlight = "default",
  onClick,
}: StatCardProps) {
  const highlightStyles = {
    default: "bento-card",
    blue: "bento-card border-blue-200 bg-blue-50/50",
    emerald: "bento-card-light-green",
    amber: "bento-card border-amber-200 bg-amber-50/50",
    purple: "bento-card border-purple-200 bg-purple-50/50",
  }[highlight];

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl p-4 transition-all",
        highlightStyles,
        onClick && "cursor-pointer hover:shadow-bento-hover"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-brand-400 tracking-widest uppercase">
          {label}
        </span>
        {Icon && <Icon className="h-4 w-4 text-brand-500" />}
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <div className="text-2xl font-bold tracking-tight text-brand-950">{value}</div>
        {trend && (
          <span
            className={cn(
              "text-[11px] font-semibold",
              trend.positive ? "text-brand-700" : "text-amber-600"
            )}
          >
            {trend.value}
          </span>
        )}
      </div>
      {subtext && <p className="mt-1 text-[11px] text-brand-500">{subtext}</p>}
    </div>
  );
}
