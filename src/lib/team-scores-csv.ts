import type { Team } from "@/types";

export const PASS1_CSV_COLUMNS = [
  ["team_id", "Team ID"],
  ["name", "Name"],
  ["track", "Track"],
  ["clarity", "Clarity"],
  ["originality", "Originality"],
  ["execution", "Execution"],
  ["feasibility", "Feasibility"],
  ["articulation", "Articulation"],
  ["composite", "Composite"],
  ["band", "Band"],
] as const;

type Pass1CsvKey = (typeof PASS1_CSV_COLUMNS)[number][0];

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

export function pass1CsvRow(team: Team): Record<Pass1CsvKey, string> {
  return {
    team_id: team.id,
    name: team.name !== team.id ? team.name : "",
    track: team.track,
    clarity: team.pass1 ? String(team.pass1.problemClarity) : "",
    originality: team.pass1 ? String(team.pass1.originality) : "",
    execution: team.pass1 ? String(team.pass1.execution) : "",
    feasibility: team.pass1 ? String(team.pass1.feasibility) : "",
    articulation: team.pass1 ? String(team.pass1.articulation) : "",
    composite: team.pass1 ? String(team.pass1.composite) : "",
    band: team.pass1?.band ?? "",
  };
}

export function downloadPass1ScoresCsv(teams: Team[]) {
  downloadCsv(PASS1_CSV_COLUMNS, pass1CsvRow, teams, "round1-scores.csv");
}

const PASS2_CSV_COLUMNS = [
  ["team_id", "Code"],
  ["name", "Name"],
  ["rank", "Rank"],
  ["round1", "Round 1"],
  ["band", "Round 1 Band"],
  ["round2", "Round 2"],
  ["judge", "Judge"],
] as const;

type Pass2CsvKey = (typeof PASS2_CSV_COLUMNS)[number][0];

function pass2CsvRow(team: Team): Record<Pass2CsvKey, string> {
  return {
    team_id: team.id,
    name: team.name !== team.id ? team.name : "",
    rank: team.finalRank != null ? String(team.finalRank) : "",
    round1: team.pass1 ? String(team.pass1.composite) : "",
    band: team.pass1?.band ?? "",
    round2: team.pass2Score != null ? String(team.pass2Score) : "",
    judge: team.pass2Verdict?.[0] ?? "",
  };
}

export function downloadPass2ScoresCsv(teams: Team[]) {
  downloadCsv(PASS2_CSV_COLUMNS, pass2CsvRow, teams, "round2-scores.csv");
}

function downloadCsv<K extends string>(
  columns: readonly (readonly [K, string])[],
  rowFn: (team: Team) => Record<K, string>,
  teams: Team[],
  filename: string,
) {
  const header = columns.map(([, label]) => label).join(",");
  const lines = teams.map((team) =>
    columns.map(([key]) => csvCell(rowFn(team)[key])).join(","),
  );
  const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
