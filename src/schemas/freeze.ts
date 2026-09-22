import { z } from "zod";

/** Freezing is irreversible, so both the quota and the signing key must be present. */
export const freezeSchema = z.object({
  shortlistSize: z
    .number()
    .int("Shortlist size must be a whole number.")
    .min(1, "Shortlist size must be at least 1."),
  auditorId: z.string().trim().min(1, "Auditor signing key is required."),
});

export type FreezeInput = z.infer<typeof freezeSchema>;
