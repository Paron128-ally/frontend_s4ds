import type { IngestRequest } from "@/api/generated/model";

export type SkippedRegistration = { id: string; name: string; reasons: string[] };

type Track = "new_idea" | "existing_project";

/** Registration export columns match `ai/scripts/input/reg.json`. */
export function registrationsFromCsv(text: string): {
  teams: IngestRequest["teams"];
  skipped: SkippedRegistration[];
} {
  const rows = parseCsv(text).filter((row) => row.some((cell) => cell.trim()));
  if (rows.length < 2) {
    throw new Error("CSV needs a header row and at least one registration.");
  }

  const headers = rows[0].map((header) => header.trim());
  const teams: IngestRequest["teams"] = [];
  const skipped: SkippedRegistration[] = [];

  rows.slice(1).forEach((row, index) => {
    const record: Record<string, string> = {};
    headers.forEach((header, column) => {
      record[header] = row[column] ?? "";
    });
    const mapped = registrationToTeam(record, index + 2);
    if ("reasons" in mapped) skipped.push(mapped);
    else teams.push(mapped);
  });

  if (teams.length === 0 && skipped.length === 0) {
    throw new Error("CSV has no registration rows.");
  }
  return { teams, skipped };
}

function registrationToTeam(
  record: Record<string, string>,
  line: number,
): IngestRequest["teams"][number] | SkippedRegistration {
  const track = parseTrack(record.track);
  const teamId = clean(record.code || record.team_id);
  const name = clean(record.team_name) || `row ${line}`;
  if (!teamId) {
    return { id: `row-${line}`, name, reasons: ["Missing code"] };
  }

  const ideaText = buildIdeaText(record, track);
  const ideaPdf = normalizeUrl(record.idea_proposal_document);
  if (!ideaText && !ideaPdf) {
    return { id: teamId, name, reasons: ["Missing problem/solution or idea PDF"] };
  }

  return {
    team_id: teamId,
    track,
    team_name: clean(record.team_name) || null,
    idea_text: ideaText,
    idea_pdf_url: ideaPdf,
    github_url: pickGithubUrl(record, track),
    project_link: normalizeUrl(record.existing_project_link),
    resume_text: buildResumeText(record),
    registration: record,
  };
}

function parseTrack(raw: string | undefined): Track {
  return clean(raw).toLowerCase().includes("existing") ? "existing_project" : "new_idea";
}

function buildIdeaText(record: Record<string, string>, track: Track): string {
  if (track === "existing_project") {
    const baseline = clean(record.existing_project_baseline);
    return baseline ? `Existing project baseline:\n${baseline}` : "";
  }
  const parts: string[] = [];
  const problem = clean(record.problem_statement);
  const solution = clean(record.solution_summary);
  if (problem) parts.push(`Problem:\n${problem}`);
  if (solution) parts.push(`Solution:\n${solution}`);
  return parts.join("\n\n");
}

function buildResumeText(record: Record<string, string>): string | null {
  const lines: string[] = [];
  const leader = clean(record.full_name);
  if (leader) lines.push(`Leader: ${leader}${linkSuffix(record.leader_github, record.leader_linkedin)}`);
  for (let index = 2; index <= 4; index += 1) {
    const memberName = clean(record[`member${index}_name`]);
    if (!memberName) continue;
    lines.push(
      `Member ${index - 1}: ${memberName}${linkSuffix(record[`member${index}_github`], record[`member${index}_linkedin`])}`,
    );
  }
  const cohort = [clean(record.department), clean(record.year)].filter(Boolean).join(", ");
  if (cohort) lines.push(`Cohort: ${cohort}`);
  return lines.length ? lines.join("\n") : null;
}

function linkSuffix(github: string | undefined, linkedin: string | undefined): string {
  const links = [
    normalizeUrl(github, "github.com") ? `github=${normalizeUrl(github, "github.com")}` : "",
    normalizeUrl(linkedin, "linkedin.com") ? `linkedin=${normalizeUrl(linkedin, "linkedin.com")}` : "",
  ].filter(Boolean);
  return links.length ? ` (${links.join(", ")})` : "";
}

function pickGithubUrl(record: Record<string, string>, track: Track): string | null {
  const fields =
    track === "existing_project"
      ? ["existing_project_link", "leader_github", "member2_github", "member3_github", "member4_github"]
      : ["leader_github", "member2_github", "member3_github", "member4_github", "existing_project_link"];
  for (const field of fields) {
    const url = normalizeUrl(record[field], "github.com");
    if (url && /github\.com\/[^/]+\/[^/#?]+/i.test(url)) return url;
  }
  return null;
}

function normalizeUrl(raw: string | undefined, defaultHost?: string): string | null {
  const value = clean(raw);
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (defaultHost === "github.com" && !value.includes(" ")) return `https://github.com/${value.replace(/^\/+/, "")}`;
  if (value.includes("linkedin.com") || value.includes("github.com")) return `https://${value.replace(/^\/+/, "")}`;
  return value;
}

function clean(value: string | undefined): string {
  return (value ?? "").trim();
}

/** Team key from a registration export row (`code` or `team_id`). */
export function registrationTeamId(record: Record<string, string>): string {
  return clean(record.code || record.team_id);
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  const source = text.replace(/^\uFEFF/, "");
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '"') {
        if (source[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}
