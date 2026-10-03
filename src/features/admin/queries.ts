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
  pending_withdrawals_count: number;
  pending_withdrawals_amount: number;
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
    .select("user_id, sports, headline, price_per_session, verified, proof_path, rating_avg, rating_count, profile:profiles!inner(full_name, email, city, avatar_url, created_at)")
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

export async function listWithdrawals() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("withdrawals")
    .select("id, amount, status, created_at, coach:profiles!inner(full_name, email)")
    .order("status")
    .order("created_at", { ascending: false })
    .limit(100);
  return data ?? [];
}

export async function searchUsers(q: string) {
  const term = q.replace(/[%,()]/g, " ").trim();
  if (term.length < 2) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, avatar_url")
    .in("role", ["client", "coach"])
    .or(`full_name.ilike.%${term}%,email.ilike.%${term}%`)
    .limit(10);
  const users = data ?? [];
  const balances = await Promise.all(users.map((u) => supabase.rpc("wallet_balance", { uid: u.id })));
  return users.map((u, i) => ({ ...u, balance: balances[i].data ?? 0 }));
}
