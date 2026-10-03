import { z } from "@/lib/validations/zod";

export const uuid = z.uuid();

export const bookingSchema = z.object({
  slotId: z.uuid(),
  offerId: z.uuid().optional(),
  note: z.string().trim().max(500).optional(),
});

export const reviewSchema = z.object({
  bookingId: z.uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

export const withdrawalSchema = z.object({
  amount: z.number().int().positive().max(100000),
});

export const creditSchema = z.object({
  userId: z.uuid(),
  amount: z.number().int().positive().max(10000),
  reason: z.string().trim().min(3).max(200),
});

export const quizSchema = z.object({
  slug: z.string().min(1).max(100),
  answers: z.array(z.number().int().min(0).max(10)).max(50),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
export type WithdrawalInput = z.infer<typeof withdrawalSchema>;
export type CreditInput = z.infer<typeof creditSchema>;
