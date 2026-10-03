"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { uuid } from "@/lib/validations/forms";

function revalidateBookings() {
  revalidatePath("/", "layout");
}

export async function respondBookingAction(bookingId: string, accept: boolean): Promise<ActionResult> {
  await requireRole(["coach"]);
  if (!uuid.safeParse(bookingId).success) return fail("BOOKING_NOT_FOUND");
  const supabase = await createClient();
  const { error } = await supabase.rpc("respond_booking", { booking_id: bookingId, accept });
  if (error) return fail(error);
  revalidateBookings();
  return ok(null);
}

export async function cancelBookingAction(bookingId: string): Promise<ActionResult> {
  await requireRole(["client"]);
  if (!uuid.safeParse(bookingId).success) return fail("BOOKING_NOT_FOUND");
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_booking", { booking_id: bookingId });
  if (error) return fail(error);
  revalidateBookings();
  return ok(null);
}

export async function completeBookingAction(bookingId: string): Promise<ActionResult> {
  await requireRole(["client", "admin"]);
  if (!uuid.safeParse(bookingId).success) return fail("BOOKING_NOT_FOUND");
  const supabase = await createClient();
  const { error } = await supabase.rpc("complete_booking", { booking_id: bookingId });
  if (error) return fail(error);
  revalidateBookings();
  return ok(null);
}
