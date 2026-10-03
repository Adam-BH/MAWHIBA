import "server-only";
import { createClient } from "@/lib/supabase/server";

export type Metrics = {
  coaches_verified: number;
  coaches_pending: number;
  coaches_total: number;
  clients: number;
  bookings_by_status: Partial<Record<"pending" | "confirmed" | "declined" | "cancelled" | "completed", number>>;
  gmv: number;
  commission: number;
  insurance: number;
  collected: number;
  refunded: number;
  coach_due: number;
  active_offers: number;
  open_requests: number;
  proposals_total: number;
  request_conversion_pct: number;
};

export async function getMetrics(): Promise<Metrics> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_metrics");
  if (error) throw error;
  return data as Metrics;
}

export async function listCoachesForAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("coach_profiles")
    .select("user_id, slug, sports, headline, price_per_session, verified, proof_path, rating_avg, rating_count, profile:profiles!inner(full_name, email, city, avatar_url, created_at)")
    .order("verified")
    .limit(500);
  const coaches = data ?? [];
  const pendingPaths = coaches.filter((c) => !c.verified && c.proof_path).map((c) => c.proof_path!);
  const { data: signed } = pendingPaths.length
    ? await supabase.storage.from("proofs").createSignedUrls(pendingPaths, 600)
    : { data: [] };
  const urls = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));
  return coaches.map((c) => ({ ...c, proofUrl: c.proof_path ? urls.get(c.proof_path) ?? null : null }));
}

export type AdminCoach = Awaited<ReturnType<typeof listCoachesForAdmin>>[number];

/** Palmarès & certifications awaiting review (unverified, with a proof file), with signed proof URLs. */
export async function listPendingCvItems() {
  const supabase = await createClient();
  const coachEmbed = "coach:coach_profiles!inner(slug, profile:profiles!inner(full_name, email))";
  const [{ data: achievements }, { data: certifications }] = await Promise.all([
    supabase.from("athletic_achievements").select(`id, year, title, competition, result, level, proof_path, ${coachEmbed}`)
      .eq("verified", false).not("proof_path", "is", null),
    supabase.from("external_certifications").select(`id, year, title, issuer, file_path, ${coachEmbed}`)
      .eq("verified", false).not("file_path", "is", null),
  ]);
  const paths = [...(achievements ?? []).map((a) => a.proof_path!), ...(certifications ?? []).map((c) => c.file_path!)];
  const { data: signed } = paths.length ? await supabase.storage.from("proofs").createSignedUrls(paths, 600) : { data: [] };
  const urls = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));
  return {
    achievements: (achievements ?? []).map((a) => ({ ...a, proofUrl: urls.get(a.proof_path!) ?? null })),
    certifications: (certifications ?? []).map((c) => ({ ...c, proofUrl: urls.get(c.file_path!) ?? null })),
  };
}
