import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getBalance(userId: string): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("wallet_balance", { uid: userId });
  return data ?? 0;
}

export async function listTransactions(userId: string, limit = 50) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("wallet_tx")
    .select("id, amount, type, meta, created_at, booking_id")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function listMyWithdrawals(coachId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("withdrawals")
    .select("id, amount, status, created_at, processed_at")
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

/** Coach payouts this month and all time (display only; balances come from the ledger RPC). */
export async function getCoachEarnings(coachId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("wallet_tx").select("amount, created_at").eq("owner_id", coachId).eq("type", "coach_payout");
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const rows = data ?? [];
  return {
    total: rows.reduce((sum, r) => sum + r.amount, 0),
    month: rows.filter((r) => new Date(r.created_at) >= monthStart).reduce((sum, r) => sum + r.amount, 0),
  };
}
