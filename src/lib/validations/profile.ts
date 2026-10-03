import { CITIES } from "@/lib/config";
import { z } from "@/lib/validations/zod";

export const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^[+\d\s]{0,20}$/).optional(),
  city: z.enum(CITIES).or(z.literal("")),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const MAX_UPLOAD_BYTES = { avatar: 2 * 1024 * 1024, proof: 5 * 1024 * 1024 };
export const ALLOWED_TYPES = {
  avatar: ["image/png", "image/jpeg", "image/webp"],
  proof: ["image/png", "image/jpeg", "image/webp", "application/pdf"],
};
