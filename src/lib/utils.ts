import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount?: number): string {
  if (amount === undefined || !Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}h ${m}m ${s}s`;
  }
  if (m > 0) {
    return `${m}m ${s}s`;
  }
  return `${s}s`;
}

export function formatScore(score?: number): string {
  if (score === undefined || score === null || isNaN(score)) return "—";
  return score.toFixed(1);
}

export function formatPercent(n?: number, d?: number): string {
  if (n === undefined || d === undefined || d === 0 || !Number.isFinite(n) || !Number.isFinite(d)) return "—";
  return `${Math.round((n / d) * 100)}%`;
}

/** "2026-09-20T07:15:00Z" -> "07:15 UTC" (returns "—" for missing or invalid input). */
export function formatUtcTime(iso?: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return `${date.toISOString().slice(11, 16)} UTC`;
}
