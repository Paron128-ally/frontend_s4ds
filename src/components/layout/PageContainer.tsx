"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/seperator";

interface PageContainerProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function PageContainer({
  title,
  description,
  badge,
  actions,
  children,
  className,
}: PageContainerProps) {
  return (
    <div className={cn("flex-1 p-6 space-y-6 max-w-[1600px] mx-auto w-full", className)}>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-brand-950">{title}</h1>
            {badge}
          </div>
          {description && (
            <p className="text-xs text-brand-500 mt-1 font-normal max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
      </div>

      <Separator className="bg-brand-100" />

      {/* Main Body */}
      <div>{children}</div>
    </div>
  );
}
