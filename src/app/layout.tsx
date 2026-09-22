import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "KnowCode 4.0 — Agentic Shortlister",
  description: "Internal operations console for 24-hour hackathon team evaluation pipeline",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-[#f8faf8] text-brand-950 min-h-screen font-sans antialiased">
        <QueryProvider>
          <AppShell>{children}</AppShell>
        </QueryProvider>
      </body>
    </html>
  );
}
