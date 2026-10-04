import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function listMyUpcomingSlots(coachId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("slots")
    .select("id, starts_at, ends_at, location, is_booked")
    .eq("coach_id", coachId)
    .gt("starts_at", new Date().toISOString())
    .order("starts_at")
    .limit(200);
  return data ?? [];
}

/** The coach's own free slots starting in [from, to). */
export async function listSlotsInRange(coachId: string, from: Date, to: Date) {
  const supabase = await createClient();
  const { data } = await supabase.from("slots").select("id, starts_at, ends_at, location")
    .eq("coach_id", coachId).eq("is_booked", false)
    .gte("starts_at", from.toISOString()).lt("starts_at", to.toISOString());
  return data ?? [];
}

export async function listAvailableSlots(coachId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("slots")
    .select("id, starts_at, ends_at, location")
    .eq("coach_id", coachId)
    .eq("is_booked", false)
    .gt("starts_at", new Date().toISOString())
    .order("starts_at")
    .limit(60);
  return data ?? [];
}

/** A bookable slot with its coach, or null if gone/booked/past. */
export async function getBookableSlot(slotId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("slots")
    .select("id, starts_at, ends_at, location, is_booked, coach:coach_profiles!inner(user_id, price_per_session, sports, verified, profile:profiles!inner(full_name, avatar_url, city))")
    .eq("id", slotId)
    .maybeSingle();
  if (!data || data.is_booked || !data.coach.verified || new Date(data.starts_at) <= new Date()) return null;
  return data;
}
