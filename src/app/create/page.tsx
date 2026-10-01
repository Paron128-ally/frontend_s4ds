"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, AlertCircle } from "lucide-react";
import { useStartIngest } from "@/hooks/useRuns";
import { registrationsFromCsv, type SkippedRegistration } from "@/lib/registration-csv";
import { runPath } from "@/lib/run-path";
import { Button } from "@/components/ui/button";

export default function CreateRunPage() {
  const router = useRouter();
  const ingestMutation = useStartIngest();
  const [runName, setRunName] = useState("");
  const [csvText, setCsvText] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [skippedRows, setSkippedRows] = useState<SkippedRegistration[]>([]);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const readBody = () => {
    const name = runName.trim();
    if (!name) {
      setValidationMessage("Enter a run name.");
      return null;
    }
    if (!csvText) {
      setValidationMessage("Upload a registration CSV first.");
      setSkippedRows([]);
      return null;
    }
    try {
      const parsed = registrationsFromCsv(csvText);
      setSkippedRows(parsed.skipped);
      if (parsed.teams.length === 0) {
        setValidationMessage("No rows could be sent. Each team needs a code and an idea or PDF.");
        return null;
      }
      return { run_name: name, teams: parsed.teams };
    } catch (err) {
      setSkippedRows([]);
      setValidationMessage(err instanceof Error ? err.message : "Could not read the CSV.");
      return null;
    }
  };

  const handleValidate = () => {
    const body = readBody();
    if (!body) return;
    const skipped = body.teams && skippedRows.length ? ` ${skippedRows.length} rows skipped.` : "";
    setValidationMessage(`Valid cohort. ${body.teams.length} teams ready.${skipped} Nothing was sent.`);
  };

  const handleIngest = async () => {
    const body = readBody();
    if (!body) return;
    setValidationMessage(null);
    try {
      const result = await ingestMutation.mutateAsync(body);
      router.push(runPath(result.run_id, "dashboard"));
    } catch (err) {
      console.error("Ingest failed:", err);
      setValidationMessage(err instanceof Error ? err.message : "Ingest failed.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-10">
      <div>
        <Link href="/" className="text-xs font-semibold text-brand-600 hover:text-brand-900">
          ← All runs
        </Link>
        <h1 className="mt-2 text-xl font-bold text-brand-950">New scoring run</h1>
        <p className="mt-1 text-xs text-brand-500">Name this run, then upload the registration CSV.</p>
      </div>

      <label className="block space-y-1">
        <span className="text-xs font-semibold text-brand-800">Run name</span>
        <input
          type="text"
          value={runName}
          onChange={(e) => setRunName(e.target.value)}
          placeholder="e.g. KnowCode 4.0 — Main hall"
          className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm"
        />
      </label>

      <div className="rounded-xl border border-brand-200 bg-white p-5 space-y-3">
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = () => setCsvText(typeof reader.result === "string" ? reader.result : null);
            reader.readAsText(file);
          }}
        />
        <p className="text-xs text-brand-500">{fileName ?? "Registration export CSV (same columns as reg.json)."}</p>
      </div>

      {validationMessage && (
        <p className="flex items-start gap-2 text-sm text-brand-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {validationMessage}
        </p>
      )}

      {skippedRows.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          {skippedRows.length} row(s) skipped (missing code or idea).
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={handleValidate}>
          Dry run
        </Button>
        <Button type="button" onClick={handleIngest} disabled={ingestMutation.isPending}>
          <Play className="mr-1 h-4 w-4" />
          {ingestMutation.isPending ? "Starting..." : "Start ingest"}
        </Button>
      </div>
    </div>
  );
}
