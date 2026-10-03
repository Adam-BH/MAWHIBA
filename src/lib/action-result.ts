import "server-only";
import { getTranslations } from "next-intl/server";

export type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: string };

const KNOWN_ERRORS = [
  "FORBIDDEN", "INSUFFICIENT_FUNDS", "SLOT_NOT_FOUND", "SLOT_UNAVAILABLE", "COACH_NOT_VERIFIED",
  "BOOKING_NOT_FOUND", "INVALID_TRANSITION", "SESSION_STARTED", "SESSION_NOT_STARTED",
  "INVALID_PACK", "INVALID_AMOUNT", "INVALID_ANSWERS", "INVALID_CREDENTIALS", "EMAIL_TAKEN", "CONFIRM_EMAIL",
  "SLOT_HAS_BOOKINGS", "SLOT_IN_PAST", "UPLOAD_INVALID", "ALREADY_REVIEWED",
  "OFFER_HAS_BOOKINGS", "MAX_OFFERS", "INCLUSIVE_BADGE_REQUIRED", "OFFER_UNAVAILABLE", "OFFER_REQUIRED",
  "MAX_OPEN_REQUESTS", "CONTACT_INFO", "REQUEST_CLOSED", "SPORT_MISMATCH", "ALREADY_PROPOSED", "NOT_FOUND",
] as const;

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

/** Maps an RPC error code (or anything else) to a French message. */
export async function fail(error?: { message?: string } | string | null): Promise<ActionResult<never>> {
  const t = await getTranslations("errors");
  const message = typeof error === "string" ? error : error?.message ?? "";
  const code = KNOWN_ERRORS.find((k) => message.includes(k));
  return { ok: false, error: code ? t(code) : t("generic") };
}

/** Error for invalid form input (zod), already in French from the schema. */
export function invalid(message: string): ActionResult<never> {
  return { ok: false, error: message };
}
