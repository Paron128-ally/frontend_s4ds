"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface BandChartProps {
  bands?: {
    reject: number;
    borderline: number;
    fastTrack: number;
  };
  scoreBuckets?: { range: string; count: number }[];
}

const defaultBands = { reject: 0, borderline: 0, fastTrack: 0 };

export default function BandChart({ bands = defaultBands, scoreBuckets }: BandChartProps) {
  const [viewMode, setViewMode] = useState<"bands" | "histogram">("bands");

  const totalScored = bands.reject + bands.borderline + bands.fastTrack;
  const rejectPct = totalScored > 0 ? Math.round((bands.reject / totalScored) * 100) : 0;
  const borderlinePct = totalScored > 0 ? Math.round((bands.borderline / totalScored) * 100) : 0;
  const fastTrackPct = totalScored > 0 ? Math.round((bands.fastTrack / totalScored) * 100) : 0;

  const bandData = [
    {
      name: "REJECT",
      count: bands.reject,
      percentage: `${rejectPct}%`,
      color: "#ef4444",
      action: "Terminates at Pass-1",
    },
    {
      name: "BORDERLINE",
      count: bands.borderline,
      percentage: `${borderlinePct}%`,
      color: "#f59e0b",
      action: "Promoted to Pass-2",
    },
    {
      name: "FAST TRACK",
      count: bands.fastTrack,
      percentage: `${fastTrackPct}%`,
      color: "#166534",
      action: "Promoted to Pass-2",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-100 pb-3">
        <div>
          <h3 className="text-xs uppercase tracking-wider text-brand-700 font-semibold">
            Pass-1 Operational Band Distribution
          </h3>
          <p className="text-[11px] text-brand-400">
            {totalScored} teams scored across 3 operational tiers
          </p>
        </div>

        {scoreBuckets && (
          <div className="flex items-center gap-1 rounded-lg bg-brand-50 p-1 border border-brand-100 self-start">
            <button
              onClick={() => setViewMode("bands")}
              className={`px-2.5 py-1 text-[11px] rounded-md transition-colors ${
                viewMode === "bands"
                  ? "bg-brand-800 text-white font-bold shadow-sm"
                  : "text-brand-600 hover:text-brand-800"
              }`}
            >
              Bands View
            </button>
            <button
              onClick={() => setViewMode("histogram")}
              className={`px-2.5 py-1 text-[11px] rounded-md transition-colors ${
                viewMode === "histogram"
                  ? "bg-brand-800 text-white font-bold shadow-sm"
                  : "text-brand-600 hover:text-brand-800"
              }`}
            >
              Score Histogram
            </button>
          </div>
        )}
      </div>

      {viewMode === "bands" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Bar / Column Chart */}
          <div className="lg:col-span-7 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bandData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#166534", fontSize: 11 }}
                  axisLine={{ stroke: "#d1fae5" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#15803d", fontSize: 10 }}
                  axisLine={{ stroke: "#d1fae5" }}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(22, 101, 52, 0.05)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-brand-200 bg-white p-2.5 shadow-lg text-xs">
                          <div className="font-bold text-brand-950 mb-1">{data.name}</div>
                          <div className="text-brand-700">Count: {data.count} teams ({data.percentage})</div>
                          <div className="text-brand-400 text-[10px] mt-1">{data.action}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {bandData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Summary Cards */}
          <div className="lg:col-span-5 space-y-2.5">
            {bandData.map((b) => (
              <div
                key={b.name}
                className="flex items-center justify-between rounded-xl border border-brand-100 bg-brand-50/50 p-3 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: b.color }}
                  />
                  <div>
                    <span className="text-xs font-semibold text-brand-900 block">{b.name}</span>
                    <span className="text-[10px] text-brand-400">{b.action}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-brand-950">{b.count}</div>
                  <div className="text-[10px] text-brand-400">{b.percentage}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Score Histogram */
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoreBuckets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="range"
                tick={{ fill: "#166534", fontSize: 10 }}
                axisLine={{ stroke: "#d1fae5" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#15803d", fontSize: 10 }}
                axisLine={{ stroke: "#d1fae5" }}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(22, 101, 52, 0.05)" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-brand-200 bg-white p-2.5 shadow-lg text-xs">
                        <div className="font-bold text-brand-950">Score Range: {data.range}</div>
                        <div className="text-brand-700 font-bold mt-1">{data.count} teams</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" fill="#166534" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
