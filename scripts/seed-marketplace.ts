import type { SeedCoach } from "./seed-data/coaches";
import { check, db, must } from "./seed-data/db";
import { DEMO_COACH_OFFERS, DEMO_REQUEST, OTHER_REQUESTS, offersFor } from "./seed-data/marketplace";

type Coach = { id: string; coach: SeedCoach };

async function seedOffers(coaches: Coach[]) {
  for (const [i, { id, coach }] of coaches.entries()) {
    const { count } = await db.from("offers").select("id", { count: "exact", head: true }).eq("coach_id", id);
    if (count) continue;
    const rows = (i === 0 ? DEMO_COACH_OFFERS : offersFor(coach)).map((o) => ({ is_inclusive: false, ...o, coach_id: id }));
    check(await db.from("offers").insert(rows), `offers ${coach.email}`);
  }
}

/** Latest free slot, so demos that book the first slots don't collide with seeded proposals. */
async function lateFreeSlot(coachId: string) {
  return must(
    await db.from("slots").select("id").eq("coach_id", coachId).eq("is_booked", false)
      .gt("starts_at", new Date().toISOString()).order("starts_at", { ascending: false }).limit(1).single(),
    "free slot",
  ).id;
}

/** A past completed booking, re-linked as the outcome of a fulfilled request. */
async function seedFulfilledRequest() {
  const booking = must(
    await db.from("bookings").select("id, slot_id, coach_id, client_id, price, created_at").eq("status", "completed")
      .order("created_at").limit(1).single(),
    "completed booking",
  );
  const coach = must(await db.from("coach_profiles").select("sports").eq("user_id", booking.coach_id).single(), "coach");
  const created = new Date(new Date(booking.created_at).getTime() - 2 * 86_400_000).toISOString();
  const request = must(await db.from("requests").insert({
    client_id: booking.client_id, sport: coach.sports[0], city: "Tunis", audience: "adulte", level: "debutant",
    title: `Séances de ${coach.sports[0].toLowerCase()} pour débutant`, description: "Je débute et je cherche un coach motivant.",
    schedule_note: "Week-end", budget_min: 30, budget_max: 80, status: "fulfilled", created_at: created,
  }).select("id").single(), "fulfilled request");
  const proposal = must(await db.from("proposals").insert({
    request_id: request.id, coach_id: booking.coach_id, slot_id: booking.slot_id, price: booking.price,
    message: "Avec plaisir ! Je vous propose une première séance découverte.", status: "accepted", created_at: created,
  }).select("id").single(), "accepted proposal");
  check(await db.from("bookings").update({ request_id: request.id, proposal_id: proposal.id }).eq("id", booking.id), "link booking");
}

export async function seedMarketplace(verified: Coach[], ids: { demoClient: string; clients: string[] }) {
  await seedOffers(verified);
  const { count } = await db.from("requests").select("id", { count: "exact", head: true });
  if (count) return console.log("• requests already seeded");

  const demo = must(await db.from("requests").insert({ ...DEMO_REQUEST, client_id: ids.demoClient }).select("id").single(), "demo request");
  check(await db.from("requests").insert(OTHER_REQUESTS.map((r, i) => ({ child_age: null, ...r, client_id: ids.clients[i % ids.clients.length] }))), "requests");

  // Two proposals on the demo request: Amira in budget, another swimmer out of budget.
  const amira = verified[0].id;
  const otherSwimmer = verified.find((v, i) => i > 0 && v.coach.sports.includes("Natation"))!.id;
  check(await db.from("proposals").insert([
    { request_id: demo.id, coach_id: amira, slot_id: await lateFreeSlot(amira), price: 45,
      message: "Bonjour ! J'accompagne plusieurs enfants autistes : séances très structurées, avec un planning visuel. Je vous propose une première séance pour faire connaissance." },
    { request_id: demo.id, coach_id: otherSwimmer, slot_id: await lateFreeSlot(otherSwimmer), price: 55,
      message: "Ancien nageur de l'équipe nationale junior, je peux venir à La Marsa le samedi." },
  ]), "demo proposals");

  await seedFulfilledRequest();
  console.log("✔ offers, 6 open requests, 2 proposals, 1 fulfilled request");
}
