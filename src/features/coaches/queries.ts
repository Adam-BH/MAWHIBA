import "server-only";
import { createClient } from "@/lib/supabase/server";
import { INCLUSIVE_CERT_SLUG } from "@/lib/config";

export type CoachFilters = { sport?: string; city?: string; maxPrice?: number; inclusive?: boolean };

const CARD_FIELDS =
  "user_id, sports, headline, price_per_session, rating_avg, rating_count, verified, profile:profiles!inner(full_name, city, avatar_url)";

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
  return (data ?? []).map((coach) => ({ ...coach, inclusive: inclusiveIds.has(coach.user_id) }));
}

export type CoachCardData = Awaited<ReturnType<typeof listCoaches>>[number];

export async function getCoach(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("coach_profiles")
    .select("*, profile:profiles!inner(full_name, city, avatar_url)")
    .eq("user_id", id)
    .eq("verified", true)
    .maybeSingle();
  if (!data) return null;
  const inclusiveIds = await listInclusiveCoachIds();
  return { ...data, inclusive: inclusiveIds.has(id) };
}

export async function getMyCoachProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("coach_profiles").select("*").eq("user_id", userId).single();
  return data;
}

export type MyCoachProfile = NonNullable<Awaited<ReturnType<typeof getMyCoachProfile>>>;

export function profileCompleteness(coach: MyCoachProfile, profile: { avatar_url: string | null; city: string | null }) {
  const checks = [
    coach.sports.length > 0, !!coach.headline, !!coach.bio, !!coach.achievements,
    !!profile.avatar_url, !!profile.city, !!coach.proof_path || coach.verified,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
