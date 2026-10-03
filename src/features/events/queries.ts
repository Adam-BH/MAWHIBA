import "server-only";
import { createClient } from "@/lib/supabase/server";

const EVENT_FIELDS = "id, title, description, starts_at, ends_at, location, capacity, registered";

/** The next event that hasn't started, and whether `userId` is registered to it. */
export async function getNextEvent(userId?: string) {
  const supabase = await createClient();
  const { data: event } = await supabase.from("events").select(EVENT_FIELDS)
    .gt("starts_at", new Date().toISOString()).order("starts_at").limit(1).maybeSingle();
  if (!event) return null;
  if (!userId) return { ...event, isRegistered: false };
  const { count } = await supabase.from("event_registrations").select("event_id", { count: "exact", head: true })
    .eq("event_id", event.id).eq("user_id", userId);
  return { ...event, isRegistered: !!count };
}

export type NextEvent = NonNullable<Awaited<ReturnType<typeof getNextEvent>>>;

export async function listEvents() {
  const supabase = await createClient();
  const { data } = await supabase.from("events").select(EVENT_FIELDS).order("starts_at", { ascending: false }).limit(50);
  return data ?? [];
}
