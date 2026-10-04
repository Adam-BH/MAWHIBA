import { z } from "@/lib/validations/zod";

/** A coach's training place. `point: null` removes the pin. */
export const locationSchema = z.object({
  point: z.object({ lat: z.number().min(30).max(38), lng: z.number().min(7).max(12) }).nullable(),
  label: z.string().trim().max(80),
  radiusKm: z.number().int().min(1).max(100),
});

export type LocationInput = z.infer<typeof locationSchema>;
