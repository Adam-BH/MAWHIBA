import "server-only";
import { createClient } from "@/lib/supabase/server";
import { listInclusiveCoachIds } from "@/features/coaches/queries";

const REQUEST_FIELDS =
  "id, sport, city, title, description, audience, child_age, level, special_needs, special_needs_note, schedule_note, budget_min, budget_max, status, expires_at, created_at";

const PROPOSAL_FIELDS = `id, price, message, status, created_at, coach_id,
  slot:slots!inner(starts_at, ends_at, location, is_booked),
  coach:coach_profiles!inner(user_id, slug, verified, rating_avg, rating_count, sports, profile:profiles!inner(full_name, avatar_url, city))`;

export async function listMyRequests(clientId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("requests")
    .select(`${REQUEST_FIELDS}, proposals(status)`)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  return (data ?? []).map(({ proposals, ...r }) => ({
    ...r,
    proposals_count: proposals.filter((p) => p.status === "pending" || p.status === "accepted").length,
    pending_count: proposals.filter((p) => p.status === "pending").length,
  }));
}

export async function getMyRequest(requestId: string, clientId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("requests")
    .select(`${REQUEST_FIELDS}, proposals(${PROPOSAL_FIELDS})`)
    .eq("id", requestId)
    .eq("client_id", clientId)
    .maybeSingle();
  if (!data) return null;
  const inclusiveIds = await listInclusiveCoachIds();
  const order = { accepted: 0, pending: 1, rejected: 2, withdrawn: 3 } as const;
  const proposals = data.proposals
    .filter((p) => p.status !== "withdrawn")
    .map((p) => ({ ...p, inclusive: inclusiveIds.has(p.coach_id) }))
    .sort((a, b) => order[a.status] - order[b.status] || a.price - b.price);
  return { ...data, proposals };
}

export type ClientProposal = NonNullable<Awaited<ReturnType<typeof getMyRequest>>>["proposals"][number];

export async function listBoard(coachId: string, sports: string[], city?: string) {
  const supabase = await createClient();
  let query = supabase.from("request_board").select("*").eq("status", "open").in("sport", sports);
  if (city) query = query.eq("city", city);
  const [{ data }, proposed] = await Promise.all([query.order("created_at", { ascending: false }).limit(100), myProposalStatuses(coachId)]);
  return (data ?? []).map((r) => ({ ...r, myProposal: r.id ? proposed.get(r.id) ?? null : null }));
}

export async function getBoardRequest(requestId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("request_board").select("*").eq("id", requestId).maybeSingle();
  return data;
}

export type BoardRequest = NonNullable<Awaited<ReturnType<typeof getBoardRequest>>>;

async function myProposalStatuses(coachId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("proposals").select("request_id, status").eq("coach_id", coachId).in("status", ["pending", "accepted"]);
  return new Map((data ?? []).map((p) => [p.request_id, p.status]));
}

export async function getMyProposal(requestId: string, coachId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("proposals")
    .select("id, price, message, status, created_at, slot:slots!inner(starts_at, ends_at, location)")
    .eq("request_id", requestId)
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

/** Nav badge: pending proposals (client) or open matching requests not yet answered (verified coach). */
export async function getRequestsBadgeCount(userId: string, role: string): Promise<number> {
  const supabase = await createClient();
  if (role === "client") {
    const { count } = await supabase
      .from("proposals")
      .select("id, request:requests!inner(client_id, status)", { count: "exact", head: true })
      .eq("status", "pending")
      .eq("request.client_id", userId)
      .eq("request.status", "open");
    return count ?? 0;
  }
  const { data: coach } = await supabase.from("coach_profiles").select("sports, verified").eq("user_id", userId).single();
  if (!coach?.verified || coach.sports.length === 0) return 0;
  const board = await listBoard(userId, coach.sports);
  return board.filter((r) => !r.myProposal).length;
}

export async function listAllRequests() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("requests")
    .select(`${REQUEST_FIELDS}, client:profiles!inner(full_name, email), proposals(id, price, status, coach:coach_profiles!inner(profile:profiles!inner(full_name)))`)
    .order("created_at", { ascending: false })
    .limit(200);
  return data ?? [];
}
