"use client";

import React, { useState } from "react";
import { Team } from "@/types";
import TeamRow from "./TeamRow";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";

interface TeamTableProps {
  teams: Team[];
  total: number;
  filtered: number;
  isLoading?: boolean;
}

export default function TeamTable({ teams, total, filtered, isLoading }: TeamTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const totalPages = Math.max(1, Math.ceil(teams.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageTeams = teams.slice(startIndex, startIndex + pageSize);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <p className="text-xs font-mono text-gray-500">Loading team dossiers from evaluation store...</p>
        </div>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <div className="flex flex-col items-center justify-center space-y-2">
          <Inbox className="h-8 w-8 text-gray-500" />
          <h4 className="text-sm font-semibold text-gray-700">No matching teams found</h4>
          <p className="text-xs text-gray-400 max-w-sm">
            Adjust your search query, status filters, or band selection to inspect candidate records.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
      {/* Table Top Meta */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-white/50 text-xs font-mono text-gray-500">
        <div>
          Showing <span className="font-bold text-gray-950">{startIndex + 1}</span>–
          <span className="font-bold text-gray-950">{Math.min(startIndex + pageSize, teams.length)}</span> of{" "}
          <span className="font-bold text-gray-950">{filtered}</span> filtered teams
          {filtered !== total && <span> (out of {total} registered)</span>}
        </div>
        <div className="text-[11px] text-gray-400">Page {currentPage} of {totalPages}</div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-white/90 text-[11px] font-mono text-gray-500 uppercase tracking-wider">
              <th className="py-2.5 px-3">Rank</th>
              <th className="py-2.5 px-3">Team & Track</th>
              <th className="py-2.5 px-3">Project Domain</th>
              <th className="py-2.5 px-3">P1 Score</th>
              <th className="py-2.5 px-3">P2 Deep</th>
              <th className="py-2.5 px-3">Band</th>
              <th className="py-2.5 px-3">Verdict</th>
              <th className="py-2.5 px-3">Integrity</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {pageTeams.map((team) => (
              <TeamRow key={team.id} team={team} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white/40 text-xs font-mono">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 rounded border border-gray-300 bg-gray-50 px-3 py-1 text-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-7 w-7 rounded border text-xs font-mono transition-colors ${
                    currentPage === pageNum
                      ? "border-blue-500 bg-blue-600/30 font-bold text-blue-400"
                      : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && <span className="text-gray-500 px-1">...</span>}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 rounded border border-gray-300 bg-gray-50 px-3 py-1 text-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
