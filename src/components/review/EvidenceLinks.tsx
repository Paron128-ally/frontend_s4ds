"use client";

import React from "react";
import { ExternalLink, Github, FileText, Globe, Link as LinkIcon } from "lucide-react";
import { EvidenceLink } from "@/types";

interface EvidenceLinksProps {
  links?: EvidenceLink[];
}

export default function EvidenceLinks({ links }: EvidenceLinksProps) {
  if (!links || links.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 text-xs font-mono text-gray-400">
        No external evidence artifacts registered for this team.
      </div>
    );
  }

  const getIcon = (type: EvidenceLink["type"]) => {
    switch (type) {
      case "github":
        return <Github className="h-4 w-4 text-gray-700" />;
      case "readme":
        return <FileText className="h-4 w-4 text-blue-400" />;
      case "demo":
        return <Globe className="h-4 w-4 text-emerald-400" />;
      case "portfolio":
      default:
        return <LinkIcon className="h-4 w-4 text-purple-400" />;
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-700">
          Verified Evidence Links & Repositories
        </h4>
        <span className="text-[10px] font-mono text-gray-400">
          Auditor Verification Checkpoints
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {links.map((link, idx) => (
          <a
            key={idx}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-md border border-gray-200 bg-white/60 p-3 hover:border-gray-300 hover:bg-gray-50/80 transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <div className="rounded bg-gray-50 p-1.5 border border-gray-300">
                {getIcon(link.type)}
              </div>
              <div>
                <span className="font-mono text-xs font-bold text-gray-800 block group-hover:text-blue-400 transition-colors">
                  {link.label}
                </span>
                <span className="text-[10px] font-mono text-gray-400 truncate block max-w-[200px]">
                  {link.url}
                </span>
              </div>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-700 shrink-0 ml-2" />
          </a>
        ))}
      </div>
    </div>
  );
}
