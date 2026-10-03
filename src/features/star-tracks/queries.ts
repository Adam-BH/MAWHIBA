import "server-only";
import { createClient } from "@/lib/supabase/server";

const INSURED = ["pending", "confirmed", "completed"] as const;

/** Paid (therefore insured) sessions per sport, and coaches holding at least one MAWHIBA badge. Admin RLS reads everything. */
export async function getStarTracks() {
  const supabase = await createClient();
  const [{ data: bookings }, { data: badges }] = await Promise.all([
    supabase.from("bookings").select("coach:profiles!bookings_coach_id_fkey(coach_profiles(primary_sport, sports))").in("status", INSURED),
    supabase.from("coach_certifications").select("coach_id").eq("passed", true),
  ]);
  const bySport = new Map<string, number>();
  for (const b of bookings ?? []) {
    const cp = b.coach?.coach_profiles;
    const sport = cp?.primary_sport ?? cp?.sports[0];
    if (sport) bySport.set(sport, (bySport.get(sport) ?? 0) + 1);
  }
  return {
    bySport: [...bySport].sort((a, b) => b[1] - a[1]),
    badges: badges?.length ?? 0,
    certifiedCoaches: new Set((badges ?? []).map((b) => b.coach_id)).size,
  };
}
