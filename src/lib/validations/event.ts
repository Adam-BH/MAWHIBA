import { z } from "@/lib/validations/zod";

export const eventSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(2000),
  date: z.iso.date(),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  duration: z.number().int().min(30).max(720),
  location: z.string().trim().min(2).max(200),
  capacity: z.number().int().min(1).max(10000),
});

export type EventInput = z.infer<typeof eventSchema>;
