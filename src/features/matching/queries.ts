import "server-only";
import { listCoaches, type CoachCardData } from "@/features/coaches/queries";
import { MATCH_REASONS, type MatchReason } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

export type Match = { score: number; reasons: MatchReason[] };
export type MatchedCoach = CoachCardData & { match?: Match };

const reasonsOf = (codes: string[]) => codes.filter((c): c is MatchReason => (MATCH_REASONS as readonly string[]).includes(c));

/** Scores for the signed-in client (weights live in SQL `match_coaches`). Empty for any other role. */
export async function getCoachMatches(sport?: string, limit = 60) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("match_coaches", { p_limit: limit, p_sport: sport });
  return new Map((data ?? []).map((m) => [m.coach_id, { score: m.score, reasons: reasonsOf(m.reasons), distanceKm: m.distance_km }]));
}

/** Coach cards in match order, with their reasons and distance from the client. */
export async function listMatchedCoaches(limit = 12, sport?: string): Promise<MatchedCoach[]> {
  const matches = await getCoachMatches(sport, limit);
  if (!matches.size) return [];
  const cards = await listCoaches({ ids: [...matches.keys()] });
  return [...matches].flatMap(([id, { distanceKm, ...match }]) => {
    const card = cards.find((c) => c.user_id === id);
    return card ? [{ ...card, distanceKm, match }] : [];
  });
}

/** Re-sorts already filtered cards by match score ("Pour vous"); unmatched cards keep their order at the end. */
export function sortByMatch(cards: CoachCardData[], matches: Awaited<ReturnType<typeof getCoachMatches>>): MatchedCoach[] {
  const scored = cards.map((c) => {
    const m = matches.get(c.user_id);
    return m ? { ...c, distanceKm: c.distanceKm ?? m.distanceKm, match: { score: m.score, reasons: m.reasons } } : c;
  });
  return scored.sort((a, b) => ("match" in b ? b.match.score : -1) - ("match" in a ? a.match.score : -1));
}

export async function listSimilarCoaches(coachId: string) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("similar_coaches", { p_coach: coachId });
  if (!data?.length) return [];
  const cards = await listCoaches({ ids: data.map((d) => d.coach_id) });
  return data.flatMap((d) => cards.filter((c) => c.user_id === d.coach_id));
}

/** Board scores for the signed-in coach, keyed by request id. Never includes client identity. */
export async function getRequestMatches() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("match_requests_for_coach", { p_limit: 100 });
  return new Map((data ?? []).map((m) => [m.request_id, { score: m.score, reasons: reasonsOf(m.reasons) }]));
}
