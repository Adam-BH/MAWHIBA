import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/lib/supabase/database.types";

const PAYMENT_FIELDS = `id, amount, price, insurance_fee, status, expires_at, created_at, slot_id, offer_id,
  proposal:proposals(request_id),
  client:profiles!payments_client_id_fkey(full_name),
  slot:slots!inner(starts_at, coach:coach_profiles!inner(profile:profiles!inner(full_name)))`;

/** A pending payment past its hold reads as expired (no cron). */
export function paymentStatus(p: { status: Enums<"payment_status">; expires_at: string }, now = new Date()) {
  return p.status === "pending" && new Date(p.expires_at) <= now ? "expired" : p.status;
}

export async function getPayment(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("payments").select(PAYMENT_FIELDS).eq("id", id).maybeSingle();
  return data;
}

export async function listPayments(clientId?: string) {
  const supabase = await createClient();
  let query = supabase.from("payments").select(PAYMENT_FIELDS);
  if (clientId) query = query.eq("client_id", clientId);
  const { data } = await query.neq("status", "failed").order("created_at", { ascending: false }).limit(100);
  return data ?? [];
}

export type PaymentRow = Awaited<ReturnType<typeof listPayments>>[number];

/** Derived in SQL from completed sessions (coach share after commission). */
export async function getEarnings(): Promise<{ total: number; month: number; sessions: number }> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("my_earnings");
  return (data as { total: number; month: number; sessions: number } | null) ?? { total: 0, month: 0, sessions: 0 };
}
