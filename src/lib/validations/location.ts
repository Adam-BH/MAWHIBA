import { z } from "@/lib/validations/zod";

/** A coach's training place. `point: null` removes the pin. */
export const locationSchema = z.object({
  point: z.object({ lat: z.number().min(30).max(38), lng: z.number().min(7).max(12) }).nullable(),
  label: z.string().trim().max(80),
  radiusKm: z.number().int().min(1).max(100),
});

/** `?near=36.88,10.32`: 2 decimals max (no precise client location in URLs), inside Tunisia, else ignored. */
export const nearParam = z.string().regex(/^\d{2}(\.\d{1,2})?,\d{1,2}(\.\d{1,2})?$/)
  .transform((s) => { const [lat, lng] = s.split(",").map(Number); return { lat, lng }; })
  .pipe(locationSchema.shape.point.unwrap());

export function parseNear(value: string | undefined) {
  const parsed = nearParam.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

export type LocationInput = z.infer<typeof locationSchema>;
