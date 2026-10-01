"use client";

import React, { useSyncExternalStore } from "react";
import { AlertTriangle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/services/http";

/**
 * Shows a slim banner whenever any data request has failed, so a down or
 * misconfigured backend is obvious instead of leaving pages stuck on "Loading…".
 * (Never triggers in mock mode.)
 */
export default function ApiErrorBanner() {
  const queryClient = useQueryClient();
  const cache = queryClient.getQueryCache();

  const getMessage = () => {
    const failed = cache.findAll({ predicate: (q) => q.state.status === "error" });
    if (failed.length === 0) return null;

    const error = failed[0].state.error;
    return error instanceof ApiError
      ? error.status === 0
        ? error.message
        : `${error.status} — ${error.message}`
      : error instanceof Error
        ? error.message
        : "Unknown error";
  };

  const message = useSyncExternalStore(
    (onStoreChange) => cache.subscribe(onStoreChange),
    getMessage,
    () => null
  );

  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-2 border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700"
    >
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>
        <strong className="font-semibold">Can&apos;t load data from the backend.</strong> {message}
      </span>
    </div>
  );
}
