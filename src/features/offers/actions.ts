"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fail, invalid, ok, type ActionResult } from "@/lib/action-result";
import { uuid } from "@/lib/validations/forms";
import { offerSchema, type OfferInput } from "@/lib/validations/offers";

function toRow(input: OfferInput) {
  const { title, sport, description, duration, price, audience, isInclusive, isActive } = input;
  return { title, sport, description, duration_min: duration, price, audience, is_inclusive: isInclusive, is_active: isActive };
}

export async function saveOfferAction(input: OfferInput, offerId?: string): Promise<ActionResult> {
  const user = await requireRole(["coach"]);
  const parsed = offerSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0].message);
  if (offerId && !uuid.safeParse(offerId).success) return fail("NOT_FOUND");
  const supabase = await createClient();
  const { error } = offerId
    ? await supabase.from("offers").update(toRow(parsed.data)).eq("id", offerId).eq("coach_id", user.id)
    : await supabase.from("offers").insert({ ...toRow(parsed.data), coach_id: user.id });
  if (error) return fail(error);
  revalidatePath("/", "layout");
  return ok(null);
}

export async function setOfferActiveAction(offerId: string, active: boolean): Promise<ActionResult> {
  const user = await requireRole(["coach"]);
  if (!uuid.safeParse(offerId).success) return fail("NOT_FOUND");
  const supabase = await createClient();
  const { error } = await supabase.from("offers").update({ is_active: active }).eq("id", offerId).eq("coach_id", user.id);
  if (error) return fail(error);
  revalidatePath("/", "layout");
  return ok(null);
}

export async function deleteOfferAction(offerId: string): Promise<ActionResult> {
  const user = await requireRole(["coach"]);
  if (!uuid.safeParse(offerId).success) return fail("NOT_FOUND");
  const supabase = await createClient();
  const { error } = await supabase.from("offers").delete().eq("id", offerId).eq("coach_id", user.id);
  // 23503: referenced by a booking → can only be deactivated.
  if (error) return fail(error.code === "23503" ? "OFFER_HAS_BOOKINGS" : error);
  revalidatePath("/", "layout");
  return ok(null);
}
