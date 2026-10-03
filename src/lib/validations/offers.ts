import { OFFER_AUDIENCES, SPORTS } from "@/lib/config";
import { z } from "@/lib/validations/zod";

export const offerSchema = z.object({
  title: z.string().trim().min(3).max(80),
  sport: z.enum(SPORTS),
  description: z.string().trim().max(500),
  duration: z.number().int().min(15).max(240),
  price: z.number().int().min(1).max(1000),
  audience: z.enum(OFFER_AUDIENCES),
  isInclusive: z.boolean(),
  isActive: z.boolean(),
});

export type OfferInput = z.infer<typeof offerSchema>;
