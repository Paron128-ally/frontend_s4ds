"use client";

import React from "react";
import { Search, X, RotateCcw, Filter, ArrowUpDown } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import type { TeamFilters as TeamFilterParams } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TeamFilters() {
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    bandFilter,
    setBandFilter,
    trackFilter,
    setTrackFilter,
    integrityOnly,
    setIntegrityOnly,
    overriddenOnly,
    setOverriddenOnly,
    minScore,
    setMinScore,
    maxScore,
    setMaxScore,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    resetFilters,
  } = useUIStore();

  const isFiltered =
    searchQuery !== "" ||
    statusFilter !== "ALL" ||
    bandFilter !== "ALL" ||
    trackFilter !== "ALL" ||
    integrityOnly ||
    overriddenOnly ||
    minScore !== undefined ||
    maxScore !== undefined;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-3">
      {/* Top Search & Reset Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search teams by ID, name, theme, or idea keyword..."
            className="w-full rounded-md border border-gray-300 bg-white/90 pl-9 pr-8 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-blue-500 font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Reset Action */}
        {isFiltered && (
          <Button
            onClick={resetFilters}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 self-start border-gray-300 bg-gray-50/80 px-2.5 py-1.5 text-xs font-mono text-gray-700 hover:bg-gray-100"
          >
            <RotateCcw className="h-3 w-3" />
            Reset Filters
          </Button>
        )}
      </div>

      {/* Filter Selectors */}
      <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono pt-1">
        {/* Status Filter */}
        <div className="flex items-center gap-1">
          <span className="text-gray-400 text-[11px]">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 focus:border-blue-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="SHORTLIST">SHORTLIST</option>
            <option value="OVERRIDE">OVERRIDE</option>
            <option value="P2_DONE">P2_DONE</option>
            <option value="P2_QUEUED">P2_QUEUED</option>
            <option value="P1_DONE">P1_DONE</option>
            <option value="REJECT">REJECT</option>
            <option value="INCOMPLETE">INCOMPLETE</option>
          </select>
        </div>

        {/* Band Filter */}
        <div className="flex items-center gap-1">
          <span className="text-gray-400 text-[11px]">P1 Band:</span>
          <select
            value={bandFilter}
            onChange={(e) => setBandFilter(e.target.value)}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 focus:border-blue-500 focus:outline-none"
          >
            <option value="ALL">All Bands</option>
            <option value="FAST_TRACK">FAST TRACK (~25%)</option>
            <option value="BORDERLINE">BORDERLINE (~35%)</option>
            <option value="REJECT">AUTO REJECT (~40%)</option>
          </select>
        </div>

        {/* Track Filter */}
        <div className="flex items-center gap-1">
          <span className="text-gray-400 text-[11px]">Track:</span>
          <select
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value)}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 focus:border-blue-500 focus:outline-none"
          >
            <option value="ALL">All Tracks</option>
            <option value="new_idea">New Idea</option>
            <option value="existing_project">Existing Project</option>
          </select>
        </div>

        {/* Min/Max Score Filters */}
        <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
          <span className="text-gray-400 text-[11px]">Min Score:</span>
          <Input
            type="number"
            step="0.1"
            min="0"
            max="10"
            placeholder="Min"
            value={minScore ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              setMinScore(val === "" ? undefined : Number(val));
            }}
            className="w-20 rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1">
          <span className="text-gray-400 text-[11px]">Max Score:</span>
          <Input
            type="number"
            step="0.1"
            min="0"
            max="10"
            placeholder="Max"
            value={maxScore ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              setMaxScore(val === "" ? undefined : Number(val));
            }}
            className="w-20 rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Sort Column & Order */}
        <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
          <span className="text-gray-400 text-[11px]">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as NonNullable<TeamFilterParams["sortBy"]>)}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-800 focus:border-blue-500 focus:outline-none"
          >
            <option value="rank">Shortlist Rank</option>
            <option value="composite">P1 Composite</option>
            <option value="p2Score">P2 Deep Score</option>
            <option value="name">Team Name</option>
            <option value="id">Team ID</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="rounded border border-gray-300 bg-white p-1 text-gray-700 hover:bg-gray-50"
            title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Toggle Flags */}
        <div className="flex items-center gap-2 border-l border-gray-200 pl-2">
          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-700">
            <input
              type="checkbox"
              checked={integrityOnly}
              onChange={(e) => setIntegrityOnly(e.target.checked)}
              className="rounded border-gray-300 bg-white text-blue-600 focus:ring-0"
            />
            <span className="text-[11px] text-red-300">Integrity Flags</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-700">
            <input
              type="checkbox"
              checked={overriddenOnly}
              onChange={(e) => setOverriddenOnly(e.target.checked)}
              className="rounded border-gray-300 bg-white text-blue-600 focus:ring-0"
            />
            <span className="text-[11px] text-purple-300">Overrides</span>
          </label>
        </div>
      </div>
    </div>
  );
}
