import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/lib/supabase/database.types";

const OFFER_FIELDS = "id, coach_id, title, sport, description, duration_min, price, audience, is_inclusive, is_active";

export async function listMyOffers(coachId: string) {
  const supabase = await createClient();
  const [{ data: offers }, { data: booked }] = await Promise.all([
    supabase.from("offers").select(OFFER_FIELDS).eq("coach_id", coachId).order("is_active", { ascending: false }).order("price"),
    supabase.from("bookings").select("offer_id").eq("coach_id", coachId).not("offer_id", "is", null),
  ]);
  const bookedIds = new Set((booked ?? []).map((b) => b.offer_id));
  return (offers ?? []).map((o) => ({ ...o, hasBookings: bookedIds.has(o.id) }));
}

export type MyOffer = Awaited<ReturnType<typeof listMyOffers>>[number];

export async function listCoachOffers(coachId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("offers").select(OFFER_FIELDS).eq("coach_id", coachId).eq("is_active", true).order("price");
  return data ?? [];
}

export type Offer = Awaited<ReturnType<typeof listCoachOffers>>[number];

export type OfferFilters = {
  sport?: string;
  city?: string;
  maxPrice?: number;
  audience?: Enums<"offer_audience">;
  inclusive?: boolean;
};

export async function listPublicOffers(filters: OfferFilters = {}, limit = 60) {
  const supabase = await createClient();
  let query = supabase
    .from("offers")
    .select(`${OFFER_FIELDS}, coach:coach_profiles!inner(slug, verified, rating_avg, rating_count, profile:profiles!inner(full_name, avatar_url, city))`)
    .eq("is_active", true)
    .eq("coach.verified", true);
  if (filters.sport) query = query.eq("sport", filters.sport);
  if (filters.city) query = query.eq("coach.profile.city", filters.city);
  if (filters.maxPrice) query = query.lte("price", filters.maxPrice);
  if (filters.audience) query = query.in("audience", [filters.audience, "tous"]);
  if (filters.inclusive) query = query.eq("is_inclusive", true);
  const { data } = await query.order("created_at", { ascending: false }).limit(limit);
  return data ?? [];
}
