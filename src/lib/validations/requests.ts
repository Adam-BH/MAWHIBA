import { CITIES, REQUEST_AUDIENCES, SKILL_LEVELS, SPORTS } from "@/lib/config";
import { hasContactInfo } from "@/lib/contact-info";
import { z } from "@/lib/validations/zod";

// Schemas are factories so client and server pass the same translated messages.
const safeText = (min: number, max: number, contactMessage: string) =>
  z.string().trim().min(min).max(max).refine((v) => !hasContactInfo(v), contactMessage);

export function budgetSchema(message: string) {
  return z
    .object({ min: z.number().int().min(1).max(1000), max: z.number().int().min(1).max(1000) })
    .refine((b) => b.min <= b.max, { message, path: ["max"] });
}

export function requestSchema(messages: { contact: string; budget: string; childAge: string }) {
  return z
    .object({
      sport: z.enum(SPORTS),
      city: z.enum(CITIES),
      title: safeText(5, 100, messages.contact),
      description: safeText(10, 1000, messages.contact),
      audience: z.enum(REQUEST_AUDIENCES),
      childAge: z.number().int().min(1).max(17).optional(),
      level: z.enum(SKILL_LEVELS),
      specialNeeds: z.boolean(),
      specialNeedsNote: safeText(0, 200, messages.contact),
      scheduleNote: safeText(0, 200, messages.contact),
      budget: budgetSchema(messages.budget),
    })
    .refine((v) => v.audience === "adulte" || (v.childAge !== undefined && !Number.isNaN(v.childAge)), {
      message: messages.childAge,
      path: ["childAge"],
    });
}

export function proposalSchema(contactMessage: string) {
  return z.object({
    requestId: z.uuid(),
    slotId: z.uuid(),
    price: z.number().int().min(1).max(1000),
    message: safeText(0, 600, contactMessage),
  });
}

export type RequestInput = z.infer<ReturnType<typeof requestSchema>>;
export type ProposalInput = z.infer<ReturnType<typeof proposalSchema>>;
