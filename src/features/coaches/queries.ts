import "server-only";
import { createClient } from "@/lib/supabase/server";
import { INCLUSIVE_CERT_SLUG } from "@/lib/config";

export type CoachFilters = { sport?: string; city?: string; maxPrice?: number; inclusive?: boolean };

const CARD_FIELDS =
  "user_id, slug, sports, primary_sport, highest_level, years_practice, tagline, headline, price_per_session, rating_avg, rating_count, verified, profile:profiles!inner(full_name, city, avatar_url)";

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
  const { data } = await query.order("rating_avg", { ascending: false }).limit(limit);
  const coaches = data ?? [];
  const { data: stats } = coaches.length
    ? await supabase.from("coach_cv_stats").select("coach_id, completed_sessions").in("coach_id", coaches.map((c) => c.user_id))
    : { data: [] };
  const sessions = new Map((stats ?? []).map((s) => [s.coach_id, s.completed_sessions ?? 0]));
  return coaches.map((coach) => ({
    ...coach,
    inclusive: inclusiveIds.has(coach.user_id),
    stats: { ratingAvg: Number(coach.rating_avg), ratingCount: coach.rating_count, completedSessions: sessions.get(coach.user_id) ?? 0 },
  }));
}

export type CoachCardData = Awaited<ReturnType<typeof listCoaches>>[number];

export async function getMyCoachProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("coach_profiles").select("*").eq("user_id", userId).single();
  return data;
}

