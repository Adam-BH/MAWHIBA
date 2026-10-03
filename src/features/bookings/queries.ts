import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/lib/supabase/database.types";

const BOOKING_FIELDS = `id, status, price, insurance_fee, note, created_at,
  slot:slots!inner(starts_at, ends_at, location),
  coach:profiles!bookings_coach_id_fkey(id, full_name, avatar_url),
  client:profiles!bookings_client_id_fkey(id, full_name, avatar_url, phone),
  review:reviews(id, rating)`;

async function listBookings(column: "client_id" | "coach_id" | null, userId?: string, status?: Enums<"booking_status">) {
  const supabase = await createClient();
  let query = supabase.from("bookings").select(BOOKING_FIELDS);
  if (column && userId) query = query.eq(column, userId);
  if (status) query = query.eq("status", status);
  const { data } = await query.order("created_at", { ascending: false }).limit(200);
  // PostgREST can't order a parent by an embedded column: sort by session start here.
  return (data ?? []).sort((a, b) => b.slot.starts_at.localeCompare(a.slot.starts_at));
}

export type BookingRow = Awaited<ReturnType<typeof listBookings>>[number];

export const listClientBookings = (clientId: string) => listBookings("client_id", clientId);
export const listCoachBookings = (coachId: string) => listBookings("coach_id", coachId);
export const listAllBookings = (status?: Enums<"booking_status">) => listBookings(null, undefined, status);

/** Earliest upcoming pending/confirmed booking, for dashboards. */
export function nextSession(bookings: BookingRow[], now = new Date()) {
  return bookings
    .filter((b) => (b.status === "confirmed" || b.status === "pending") && new Date(b.slot.starts_at) > now)
    .sort((a, b) => a.slot.starts_at.localeCompare(b.slot.starts_at))[0];
}
