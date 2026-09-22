import { z } from "zod";

/**
 * Validates the auditor override form. It takes the raw form *strings*
 * (what the inputs hold) and outputs the typed payload values.
 */
export const overrideFormSchema = z.object({
  overrideScore: z
    .string()
    .trim()
    .refine(
      (v) => v !== "" && Number.isFinite(Number(v)) && Number(v) >= 0 && Number(v) <= 10,
      "Please enter a valid override score between 0.0 and 10.0."
    )
    .transform(Number),
  auditorNote: z
    .string()
    .trim()
    .min(15, "A detailed written justification (minimum 15 characters) is required for audit logs."),
  auditorId: z.string().trim().min(1, "Auditor identifier is required."),
});

export type OverrideFormInput = z.input<typeof overrideFormSchema>;
export type OverrideFormValues = z.output<typeof overrideFormSchema>;
