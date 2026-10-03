import { z } from "@/lib/validations/zod";

export const slotSchema = z.object({
  date: z.iso.date(),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  duration: z.number().int().min(15).max(240),
  location: z.string().trim().min(3).max(120),
  weekly: z.boolean(),
});

export type SlotInput = z.infer<typeof slotSchema>;
