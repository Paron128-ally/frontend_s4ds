"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function formatTrack(track: string): string {
  return track.replaceAll("_", " ");
}

export default function TrackSummaryCell({
  track,
  summary,
  className,
}: {
  track: string;
  summary?: string;
  className?: string;
}) {
  const label = formatTrack(track);
  const detail = summary?.trim();
  if (!detail) {
    return <span className={cn("text-xs text-brand-600", className)}>{label}</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "text-left text-xs text-brand-600 underline decoration-dotted decoration-brand-300 underline-offset-2 hover:text-brand-900",
            className,
          )}
        >
          {label}
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-md whitespace-pre-wrap bg-brand-950 px-3 py-2 text-left text-xs leading-relaxed text-white">
        {detail}
      </TooltipContent>
    </Tooltip>
  );
}
