"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  Activity,
  SearchCheck,
  ListOrdered,
  Users,
  MessageSquareWarning,
  Lock,
  GitBranch,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useRun } from "@/hooks/useRuns";
import { useTeams } from "@/hooks/useTeams";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", section: "Overview" },
  { href: "/ingest", icon: Upload, label: "Ingest", section: "Overview" },
  { href: "/pass1", icon: Activity, label: "Pass-1", section: "Evaluation" },
  { href: "/pass2", icon: SearchCheck, label: "Pass-2", section: "Evaluation" },
  { href: "/shortlist", icon: ListOrdered, label: "Pass-2 Candidates", section: "Evaluation" },
  { href: "/team", icon: Users, label: "Teams", section: "Review" },
  { href: "/disputes", icon: MessageSquareWarning, label: "Disputes", section: "Review" },
  { href: "/freeze", icon: Lock, label: "Freeze", section: "Governance" },
  { href: "/pipeline", icon: GitBranch, label: "Pipeline", section: "System" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const sidebarCollapsed = !sidebarOpen;
  const { data: run } = useRun();
  const { data: teamsData } = useTeams({});
  const teams = teamsData?.teams;

  const totalTeams = teamsData?.total ?? 0;
  const pass1Done = teams?.filter(t => t.pass1 !== undefined).length ?? 0;
  const pass2Done = teams?.filter(t => t.pass2Score !== undefined).length ?? 0;
  const finalShortlistCount = teams?.filter(t => t.finalRank !== undefined).length ?? 0;

  const stages = [
    { label: "Ingest", done: totalTeams, total: totalTeams, color: "bg-brand-600" },
    { label: "Pass-1", done: pass1Done, total: totalTeams, color: "bg-brand-600" },
    { label: "Pass-2", done: pass2Done, total: totalTeams, color: "bg-brand-600" },
    { label: "Final Shortlist", done: finalShortlistCount, total: Math.max(run?.shortlistSize ?? totalTeams, totalTeams), color: "bg-brand-600" },
  ];

  const grouped = navItems.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);

  return (
    <nav
      className={cn(
        "relative flex flex-col border-r border-brand-100 bg-white transition-all duration-300",
        sidebarCollapsed ? "w-14" : "w-52"
      )}
    >
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-brand-200 bg-white text-brand-500 shadow-sm hover:bg-brand-50 hover:text-brand-700 transition-colors"
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {sidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto py-4 px-2">
        {Object.entries(grouped).map(([section, items]) => (
          <div key={section} className="mb-2">
            {!sidebarCollapsed && (
              <div className="px-2 pb-1 pt-2 text-[9px] font-semibold uppercase tracking-widest text-brand-400">
                {section}
              </div>
            )}
            {items.map((item) => {
              const isActive =
                item.href === "/team"
                  ? pathname.startsWith("/team")
                  : pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all duration-150",
                    isActive
                      ? "bg-brand-800 text-white shadow-sm"
                      : "text-brand-700 hover:bg-brand-50 hover:text-brand-900",
                    sidebarCollapsed && "justify-center gap-0 px-0"
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Stage progress mini meter */}
      {!sidebarCollapsed && (
        <div className="border-t border-brand-100 p-3 space-y-2">
          <div className="text-[9px] font-semibold uppercase tracking-widest text-brand-400 mb-2">Pipeline Progress</div>
          {stages.map((s) => (
            <div key={s.label}>
              <div className="flex justify-between text-[10px] text-brand-600 mb-0.5">
                <span className="font-medium">{s.label}</span>
                <span className="text-brand-400">{s.done}/{s.total}</span>
              </div>
              <div className="h-1 rounded-full bg-brand-100">
                <div
                  className={cn("h-1 rounded-full transition-all", s.color)}
                  style={{ width: `${s.total > 0 ? (s.done / s.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </nav>
  );
}
