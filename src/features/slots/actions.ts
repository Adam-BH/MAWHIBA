"use server";

import { revalidatePath } from "next/cache";
import { addDays } from "date-fns";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fail, invalid, ok, type ActionResult } from "@/lib/action-result";
import { fromLocal } from "@/lib/dates";
import { uuid } from "@/lib/validations/forms";
import { slotSchema, type SlotInput } from "@/lib/validations/slot";

const WEEKLY_REPEATS = 2;

export async function createSlotAction(input: SlotInput): Promise<ActionResult<number>> {
  const user = await requireRole(["coach"]);
  const parsed = slotSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0].message);
  const { date, time, duration, location, weekly } = parsed.data;

  const first = fromLocal(date, time);
  if (first <= new Date()) return fail("SLOT_IN_PAST");
  const rows = Array.from({ length: weekly ? WEEKLY_REPEATS + 1 : 1 }, (_, week) => {
    const starts = addDays(first, week * 7);
    return {
      coach_id: user.id,
      location,
      starts_at: starts.toISOString(),
      ends_at: new Date(starts.getTime() + duration * 60_000).toISOString(),
    };
  });

  const supabase = await createClient();
  const { error } = await supabase.from("slots").insert(rows);
  if (error) return fail(error);
  revalidatePath("/sessions");
  return ok(rows.length);
}

export async function deleteSlotAction(slotId: string): Promise<ActionResult> {
  const user = await requireRole(["coach"]);
  if (!uuid.safeParse(slotId).success) return fail("NOT_FOUND");
  const supabase = await createClient();
  const { data, error } = await supabase.from("slots").delete().eq("id", slotId).eq("coach_id", user.id).select("id");
  if (error) return fail(error);
  if (!data.length) return fail("SLOT_HAS_BOOKINGS");
  revalidatePath("/sessions");
  return ok(null);
}
