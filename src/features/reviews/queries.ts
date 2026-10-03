import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function listCoachReviews(coachId: string, limit = 20) {
  const supabase = await createClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, client_id")
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (!reviews?.length) return [];
  const { data: authors } = await supabase
    .from("public_profiles")
    .select("id, full_name")
    .in("id", reviews.map((r) => r.client_id));
  const names = new Map((authors ?? []).map((a) => [a.id, a.full_name]));
  return reviews.map((r) => ({ ...r, author: (names.get(r.client_id) ?? "").split(" ")[0] }));
}
