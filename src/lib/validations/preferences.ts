import {
  AVAILABILITY, CITIES, GOALS, LANGUAGES, MAX_PREF_GOALS, MAX_PREF_SPORTS, REQUEST_AUDIENCES, SKILL_LEVELS, SPORTS,
} from "@/lib/config";
import { z } from "@/lib/validations/zod";

const coord = (min: number, max: number) => z.number().min(min).max(max).refine((v) => Math.round(v * 100) / 100 === v);

/** Onboarding answers. Every field is optional except the lists (empty = no preference). */
export const preferencesSchema = z
  .object({
    sports: z.array(z.enum(SPORTS)).max(MAX_PREF_SPORTS),
    audience: z.enum(REQUEST_AUDIENCES).nullable(),
    childAge: z.number().int().min(1).max(17).nullable(),
    level: z.enum(SKILL_LEVELS).nullable(),
    inclusiveNeeds: z.boolean(),
    languages: z.array(z.enum(LANGUAGES)),
    city: z.enum(CITIES).nullable(),
    point: z.object({ lat: coord(30, 38), lng: coord(7, 12) }).nullable(),
    budgetMax: z.number().int().min(5).max(1000).nullable(),
    availability: z.array(z.enum(AVAILABILITY)),
    goals: z.array(z.enum(GOALS)).max(MAX_PREF_GOALS),
  })
  // Same rule as requests: a child's age is required iff the sessions are for a child.
  .refine((p) => (p.audience === "enfant") === (p.childAge !== null), { path: ["childAge"] });

export type PreferencesInput = z.infer<typeof preferencesSchema>;
