import { z } from "@/lib/validations/zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const signupSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: z.email(),
  password: z.string().min(8).max(72),
  role: z.enum(["client", "coach"]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
