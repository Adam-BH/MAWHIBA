import "server-only";
import { createClient } from "@/lib/supabase/server";
import { initials } from "@/lib/utils";
import { INCLUSIVE_CERT_SLUG } from "@/lib/config";
import { distanceKm, type LatLng } from "@/lib/geo";

export type CoachFilters = { sport?: string; city?: string; maxPrice?: number; inclusive?: boolean; near?: LatLng; ids?: string[] };

const CARD_FIELDS =
  "user_id, slug, sports, primary_sport, highest_level, years_practice, tagline, headline, price_per_session, rating_avg, rating_count, verified, map_lat, map_lng, base_label, service_radius_km, profile:profiles!inner(full_name, city, avatar_url)";

export async function listInclusiveCoachIds(): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("coach_certifications")
    .select("coach_id, certification:certifications!inner(slug)")
    .eq("passed", true)
    .eq("certification.slug", INCLUSIVE_CERT_SLUG);
  return new Set((data ?? []).map((row) => row.coach_id));
}

export async function listCoaches(filters: CoachFilters = {}, limit = 60) {
  const supabase = await createClient();
  const inclusiveIds = await listInclusiveCoachIds();
  let query = supabase.from("coach_profiles").select(CARD_FIELDS).eq("verified", true);
  if (filters.sport) query = query.contains("sports", [filters.sport]);
  if (filters.city) query = query.eq("profile.city", filters.city);
  if (filters.maxPrice) query = query.lte("price_per_session", filters.maxPrice);
  if (filters.inclusive) query = query.in("user_id", [...inclusiveIds]);
  if (filters.ids) query = query.in("user_id", filters.ids);
  const { data } = await query.order("rating_avg", { ascending: false }).limit(limit);
  const coaches = data ?? [];
  const { data: stats } = coaches.length
    ? await supabase.from("coach_cv_stats").select("coach_id, completed_sessions").in("coach_id", coaches.map((c) => c.user_id))
    : { data: [] };
  const sessions = new Map((stats ?? []).map((s) => [s.coach_id, s.completed_sessions ?? 0]));
  const { near } = filters;
  const cards = coaches.map((coach) => ({
    ...coach,
    inclusive: inclusiveIds.has(coach.user_id),
    stats: { ratingAvg: Number(coach.rating_avg), ratingCount: coach.rating_count, completedSessions: sessions.get(coach.user_id) ?? 0 },
    // Display only (≤ 60 cards): matching distances are computed in SQL.
    distanceKm: near && coach.map_lat !== null && coach.map_lng !== null ? distanceKm(near, { lat: coach.map_lat, lng: coach.map_lng }) : null,
  }));
  return near ? cards.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)) : cards;
}

/** Public, approximate pins of every verified coach, for the mini maps. */
export async function listCoachPins() {
  const supabase = await createClient();
  const { data } = await supabase.from("coach_profiles")
    .select("user_id, map_lat, map_lng, profile:profiles!inner(full_name)")
    .eq("verified", true).not("map_lat", "is", null);
  return (data ?? []).flatMap((c) => c.map_lat !== null && c.map_lng !== null
    ? [{ id: c.user_id, lat: c.map_lat, lng: c.map_lng, initials: initials(c.profile.full_name) }] : []);
}

export type CoachCardData = Awaited<ReturnType<typeof listCoaches>>[number];

/** The exact training pin: readable by its owner (and admins) only. */
export async function getCoachPin(coachId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("coach_locations").select("lat, lng").eq("coach_id", coachId).maybeSingle();
  return data;
}

export async function getMyCoachProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("coach_profiles").select("*").eq("user_id", userId).single();
  return data;
}

