"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { fail, invalid, ok, type ActionResult } from "@/lib/action-result";
import { fromLocal } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import { uuid } from "@/lib/validations/forms";
import { eventSchema, type EventInput } from "@/lib/validations/event";

export async function registerEventAction(eventId: string, attend: boolean): Promise<ActionResult> {
  await requireRole(["client", "coach"]);
  if (!uuid.safeParse(eventId).success) return fail("NOT_FOUND");
  const supabase = await createClient();
  const { error } = attend
    ? await supabase.rpc("register_event", { event_id: eventId })
    : await supabase.rpc("unregister_event", { event_id: eventId });
  if (error) return fail(error);
  revalidatePath("/", "layout");
  return ok(null);
}

export async function createEventAction(input: EventInput): Promise<ActionResult> {
  await requireRole(["admin"]);
  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0].message);
  const { title, description, date, time, duration, location, capacity } = parsed.data;
  const starts = fromLocal(date, time);
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_create_event", {
    title, description, location, capacity,
    starts_at: starts.toISOString(), ends_at: new Date(starts.getTime() + duration * 60_000).toISOString(),
  });
  if (error) return fail(error);
  revalidatePath("/", "layout");
  return ok(null);
}
