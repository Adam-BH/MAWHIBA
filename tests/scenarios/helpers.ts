import { config } from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

config({ path: ".env.local", quiet: true });
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const service = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/** Scenarios write to the DB: they only run with `npm run test:scenarios` against a local Supabase. */
export const enabled = !!process.env.SCENARIOS && !!url && !!anon && !!service;

type Db = SupabaseClient<Database>;
export const admin: Db = createClient<Database>(url || "http://localhost", service || "x", { auth: { persistSession: false } });

const PASSWORD = "Scenario2026!";
const RUN = crypto.randomUUID().slice(0, 8); // per worker: test files run in parallel
const created: string[] = [];
let n = 0;

export function check(res: { error: { message: string } | null }) {
  if (res.error) throw new Error(res.error.message);
}

function must<T>(res: { data: T; error: { message: string } | null }): NonNullable<T> {
  if (res.error || res.data === null || res.data === undefined) throw new Error(res.error?.message ?? "no data");
  return res.data;
}

export async function signIn(email: string, password = PASSWORD): Promise<Db> {
  const db = createClient<Database>(url, anon, { auth: { persistSession: false } });
  check(await db.auth.signInWithPassword({ email, password }));
  return db;
}

export async function makeUser(role: "client" | "coach" | "admin") {
  const email = `scenario-${RUN}-${++n}@test.mawhiba.tn`;
  const { data, error } = await admin.auth.admin.createUser({
    email, password: PASSWORD, email_confirm: true,
    user_metadata: { role: role === "admin" ? "client" : role, full_name: `Test${n} Scenario` },
  });
  if (error || !data.user) throw new Error(error?.message);
  const id = data.user.id;
  created.push(id);
  if (role === "admin") check(await admin.from("profiles").update({ role: "admin" }).eq("id", id));
  return { id, email, db: await signIn(email) };
}

/** Verified swimming coach with one 40-pt offer and three future slots. */
export async function makeCoach({ verified = true } = {}) {
  const coach = await makeUser("coach");
  check(await admin.from("coach_profiles").update({ sports: ["Natation"], verified }).eq("user_id", coach.id));
  const offer = must(await admin.from("offers")
    .insert({ coach_id: coach.id, title: "Séance test", sport: "Natation", duration_min: 60, price: 40, audience: "tous" })
    .select("id").single());
  const day = 86_400_000;
  const slots = must(await admin.from("slots").insert([1, 2, 3].map((d) => ({
    coach_id: coach.id, location: "Piscine test",
    starts_at: new Date(Date.now() + d * day).toISOString(), ends_at: new Date(Date.now() + d * day + 3_600_000).toISOString(),
  }))).select("id, starts_at").order("starts_at"));
  return { ...coach, offerId: offer.id, slotIds: slots.map((s) => s.id) };
}

/** Adult swimming request; `child_age` is ignored by the RPC for adults. */
export const postRequest = (db: Db, overrides: { title?: string; description?: string } = {}) => db.rpc("create_request", {
  sport: "Natation", city: "Tunis", title: "Apprendre à nager", description: "Je débute, je cherche un coach patient.",
  audience: "adulte", child_age: 0, level: "debutant", special_needs: false,
  special_needs_note: "", schedule_note: "Samedi matin", budget_min: 30, budget_max: 60, ...overrides,
});

/** Konnect's webhook: only the service role may confirm a payment. */
export const confirm = (paymentId: string, success = true) =>
  admin.rpc("confirm_payment", { payment_id: paymentId, success, provider_ref: "scenario" });

/** Checkout + successful payment; returns the booking id. */
export async function payAndBook(client: Db, slotId: string, offerId?: string) {
  const paymentId = must(await client.rpc("start_checkout", { slot_id: slotId, offer_id: offerId }));
  return must(await confirm(paymentId));
}

/** Deletes everything the run created, children first (bookings don't cascade). */
export async function cleanup() {
  if (!created.length) return;
  const { data: bookings } = await admin.from("bookings").select("id")
    .or(`client_id.in.(${created}),coach_id.in.(${created})`);
  const bookingIds = (bookings ?? []).map((b) => b.id);
  check(await admin.from("payments").delete().in("client_id", created));
  check(await admin.from("reviews").delete().in("client_id", created));
  if (bookingIds.length) check(await admin.from("bookings").delete().in("id", bookingIds));
  for (const id of created) check(await admin.auth.admin.deleteUser(id));
  created.length = 0;
}
