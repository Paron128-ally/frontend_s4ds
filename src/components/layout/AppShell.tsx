"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ApiErrorBanner from "./ApiErrorBanner";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <main className="min-h-screen bg-brand-50">{children}</main>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8faf8] text-brand-950 font-sans">
      <Header />
      <ApiErrorBanner />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-16">{children}</main>
      </div>
    </div>
  );
}
