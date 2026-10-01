import { z } from "zod";

const teamInputSchema = z
  .object({
    team_id: z.string().trim().min(1, "Each team needs a team_id."),
    track: z.enum(["new_idea", "existing_project"], { message: "Track must be new_idea or existing_project." }),
    idea_text: z.string().optional(),
    idea_pdf_url: z.string().nullable().optional(),
    idea_images: z.array(z.string()).optional(),
    resume_text: z.string().nullable().optional(),
    github_url: z.string().nullable().optional(),
    project_link: z.string().nullable().optional(),
    portfolio_url: z.string().nullable().optional(),
    team_name: z.string().nullable().optional(),
  })
  .refine((team) => Boolean(team.idea_text?.trim() || team.idea_pdf_url?.trim()), {
    message: "Each team needs idea_text or idea_pdf_url.",
  });

export const ingestRequestSchema = z.object({
  run_name: z.string().trim().min(1, "Enter a run name."),
  teams: z.array(teamInputSchema).min(1, "Add at least one team."),
});

export type IngestBody = z.infer<typeof ingestRequestSchema>;
