import { CITIES, SPORTS } from "@/lib/config";
import { z } from "@/lib/validations/zod";

export const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^[+\d\s]{0,20}$/).optional(),
  city: z.enum(CITIES).or(z.literal("")),
});

export const coachProfileSchema = profileSchema.extend({
  sports: z.array(z.enum(SPORTS)).min(1).max(4),
  headline: z.string().trim().min(5).max(120),
  bio: z.string().trim().max(1000),
  achievements: z.string().trim().max(500),
  price: z.number().int().min(5).max(1000),
  duration: z.number().int().min(15).max(240),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type CoachProfileInput = z.infer<typeof coachProfileSchema>;

export const MAX_UPLOAD_BYTES = { avatar: 2 * 1024 * 1024, proof: 5 * 1024 * 1024 };
export const ALLOWED_TYPES = {
  avatar: ["image/png", "image/jpeg", "image/webp"],
  proof: ["image/png", "image/jpeg", "image/webp", "application/pdf"],
};
