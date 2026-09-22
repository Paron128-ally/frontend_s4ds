"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, ArrowRight, Mail, KeyRound, CheckCircle2 } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { UserRole } from "@/types";
import { loginSchema } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const router = useRouter();
  const { userRole, setUserRole } = useUIStore();
  const [email, setEmail] = useState("auditor@knowcode.internal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleSSOLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 600);
  };

  const handleMagicLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginSchema.safeParse({ email }).success) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setMagicLinkSent(true);
      setIsSubmitting(false);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
    }, 800);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <Card className="w-full max-w-md space-y-6 rounded-xl border border-gray-200 bg-white p-0 shadow-2xl">
        <CardContent className="space-y-6 p-8">
          {/* Header */}
          <div className="space-y-2 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-950/60 font-mono text-xl font-bold text-blue-400 shadow-md">
              KC
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-950 font-sans">
              KnowCode 4.0
            </h1>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
              Agentic Shortlister
            </Badge>
            <p className="text-xs text-gray-500 pt-1">
              Internal Operations Console • 24-Hour Evaluation Window
            </p>
          </div>

          {magicLinkSent ? (
            <div className="rounded-md bg-emerald-950/80 p-4 border border-emerald-700 text-center space-y-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto" />
              <div className="text-xs font-mono font-bold text-emerald-200">
                Authorization Token Dispatched
              </div>
              <p className="text-[11px] text-emerald-300/80">
                Simulating direct SSO session redirect to Dashboard...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
            {/* Role Selection */}
            <div className="rounded-lg border border-gray-200 bg-white/60 p-3.5 space-y-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-gray-500 font-bold block">
                Select Operating Credential Role
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                {(["ops", "auditor", "admin"] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setUserRole(role)}
                    className={`rounded border py-2 text-center uppercase font-bold transition-all ${
                      userRole === role
                        ? "border-blue-500 bg-blue-600/30 text-blue-300"
                        : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 font-mono pt-1">
                {userRole === "auditor"
                  ? "Auditor role permits dispute overrides and final shortlist freeze."
                  : userRole === "admin"
                  ? "Admin role grants full pipeline configuration and emergency unfreeze."
                  : "Ops role provides real-time monitoring and ingestion control."}
              </p>
            </div>

            {/* SSO Action */}
            <Button
              onClick={handleSSOLogin}
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 py-2.5 text-xs font-mono font-bold text-white shadow-md hover:bg-blue-500"
            >
              <KeyRound className="h-4 w-4" />
              <span>{isSubmitting ? "Authenticating via SSO..." : "Continue with Organizer SSO"}</span>
            </Button>

            <div className="flex items-center gap-2 text-xs text-gray-500 font-mono my-2">
              <div className="flex-1 h-px bg-gray-50" />
              <span>or</span>
              <div className="flex-1 h-px bg-gray-50" />
            </div>

            {/* Magic Link */}
            <form onSubmit={handleMagicLink} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-gray-500 block mb-1">Auditor Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="auditor@knowcode.internal"
                    className="w-full pl-9 pr-3"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="secondary"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-gray-50/80 py-2 text-xs font-mono text-gray-700 hover:bg-gray-100"
              >
                <span>Send Magic Link</span>
                <ArrowRight className="h-3.5 w-3.5 text-gray-500" />
              </Button>
            </form>
          </div>
        )}

          <div className="border-t border-gray-200/80 pt-4 text-center">
            <p className="text-[10px] text-gray-400 font-mono">
              Restricted access. Public registration is permanently disabled.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
