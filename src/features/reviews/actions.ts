"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fail, invalid, ok, type ActionResult } from "@/lib/action-result";
import { reviewSchema, type ReviewInput } from "@/lib/validations/forms";

export async function createReviewAction(input: ReviewInput): Promise<ActionResult> {
  const user = await requireRole(["client"]);
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0].message);
  const supabase = await createClient();
  const { data: booking } = await supabase
    .from("bookings")
    .select("coach_id")
    .eq("id", parsed.data.bookingId)
    .eq("client_id", user.id)
    .eq("status", "completed")
    .maybeSingle();
  if (!booking) return fail("BOOKING_NOT_FOUND");
  const { error } = await supabase.from("reviews").insert({
    booking_id: parsed.data.bookingId,
    coach_id: booking.coach_id,
    client_id: user.id,
    rating: parsed.data.rating,
    comment: parsed.data.comment || null,
  });
  if (error) return fail(error.code === "23505" ? "ALREADY_REVIEWED" : error);
  revalidatePath("/", "layout");
  return ok(null);
}
