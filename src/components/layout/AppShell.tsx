"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ApiErrorBanner from "./ApiErrorBanner";
import ErrorBoundary from "./ErrorBoundary";
import { runIdFromPathname } from "@/lib/run-path";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isBarePage = pathname === "/" || pathname === "/create" || isLoginPage;
  const runId = runIdFromPathname(pathname);

  if (isLoginPage) {
    return <main className="min-h-screen bg-brand-50">{children}</main>;
  }

  if (isBarePage) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8faf8] text-brand-950 font-sans">
        <header className="flex h-14 items-center border-b border-brand-100 bg-white px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-800 text-sm font-bold text-white">
              KC
            </div>
            <span className="text-sm font-semibold text-brand-950">KnowCode 4.0</span>
          </Link>
        </header>
        <main className="flex-1">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8faf8] text-brand-950 font-sans">
      <Header runId={runId} />
      <ApiErrorBanner />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar runId={runId} />
        <main className="flex-1 overflow-y-auto pb-16">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
