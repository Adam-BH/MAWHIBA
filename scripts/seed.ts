import { DEMO_COACH, EXTRA_CLIENTS, LOCATIONS, PENDING_COACHES, REVIEW_COMMENTS, VERIFIED_COACHES, type SeedCoach } from "./seed-data/coaches";
import { check, db, must } from "./seed-data/db";
import { INCLUSIVE_CERT_SLUG, INSURANCE_FEE } from "../src/lib/config";
import { DEMO_PASSWORD as PASSWORD } from "../src/lib/demo";
import { seedEvents } from "./seed-events";
import { seedMarketplace } from "./seed-marketplace";
import { seedProfiles } from "./seed-profiles";

const DAY = 86_400_000;
const avatar = (name: string) => `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`;

async function ensureUser(email: string, name: string, role: "client" | "coach", city: string) {
  const { data } = await db.auth.admin.listUsers({ perPage: 1000 });
  let id = data.users.find((u) => u.email === email)?.id;
  if (!id) {
    const { data: created, error } = await db.auth.admin.createUser({
      email, password: PASSWORD, email_confirm: true, user_metadata: { role, full_name: name },
    });
    if (error || !created.user) throw new Error(`create ${email}: ${error?.message}`);
    id = created.user.id;
  }
  check(await db.from("profiles").update({ full_name: name, city, avatar_url: avatar(name) }).eq("id", id), "profile");
  return id;
}

async function seedCoach(coach: SeedCoach, verified: boolean) {
  const id = await ensureUser(coach.email, coach.name, "coach", coach.city);
  let proof_path: string | null = null;
  if (!verified) {
    proof_path = `${id}/justificatif.pdf`;
    const pdf = "%PDF-1.1\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n";
    check(await db.storage.from("proofs").upload(proof_path, pdf, { contentType: "application/pdf", upsert: true }), "proof");
  }
  check(
    await db.from("coach_profiles").update({
      sports: coach.sports, headline: coach.headline, bio: coach.bio, achievements: coach.achievements,
      price_per_session: coach.price, verified, proof_path,
    }).eq("user_id", id),
    "coach profile",
  );
  return { id, coach };
}

/** Formations ship with the schema (migration); the seed only hands out badges. */
async function seedBadges(verified: { id: string; coach: SeedCoach }[]) {
  const certs = must(await db.from("certifications").select("id, slug"), "certifications");
  const id = (slug: string) => certs.find((c) => c.slug === slug)?.id;
  const rows = verified.flatMap(({ id: coach_id, coach }, i) => [
    coach.inclusive && id(INCLUSIVE_CERT_SLUG),
    (i === 0 || i % 3 === 1) && id("premiers-secours-seance"),
    (i === 0 || i % 5 === 2) && id("coacher-les-enfants"),
  ].filter((c): c is string => !!c).map((certification_id) => ({ coach_id, certification_id, score: 5, passed: true })));
  check(await db.from("coach_certifications").upsert(rows), "badges");
}

async function seedFutureSlots(coaches: { id: string; coach: SeedCoach }[]) {
  const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00+01:00").getTime();
  for (const { id, coach } of coaches) {
    const { count } = await db.from("slots").select("id", { count: "exact", head: true })
      .eq("coach_id", id).gt("starts_at", new Date().toISOString());
    if (count) continue;
    const location = `${LOCATIONS[coach.sports[0]] ?? LOCATIONS.Default}, ${coach.city}`;
    const rows = Array.from({ length: 14 }, (_, d) => d + 1).flatMap((d) =>
      [9, 18].filter((h) => (d + h) % 3 !== 0).map((h) => ({
        coach_id: id, location,
        starts_at: new Date(today + d * DAY + h * 3_600_000).toISOString(),
        ends_at: new Date(today + d * DAY + (h + 1) * 3_600_000).toISOString(),
      })),
    );
    check(await db.from("slots").insert(rows), "slots");
  }
}

/** A settled Konnect payment, as the gateway webhook would have left it. */
async function insertPayment(p: { client_id: string; slot_id: string; booking_id: string; price: number; status: "paid" | "refunded"; at: string }) {
  check(await db.from("payments").insert({
    client_id: p.client_id, slot_id: p.slot_id, booking_id: p.booking_id, price: p.price, insurance_fee: INSURANCE_FEE,
    status: p.status, provider_ref: `seed_${p.booking_id.slice(0, 8)}`, created_at: p.at, expires_at: p.at, paid_at: p.at,
    refunded_at: p.status === "refunded" ? new Date().toISOString() : null,
  }), "payment");
}

async function seedHistory(coaches: { id: string; coach: SeedCoach }[], clients: string[]) {
  const { count } = await db.from("bookings").select("id", { count: "exact", head: true }).eq("status", "completed");
  if (count) return console.log("• history already seeded");

  const plan = Array.from({ length: 20 }, (_, i) => ({
    coach: coaches[i % coaches.length], client: clients[i % clients.length], daysAgo: 2 + i, i,
  }));

  for (const { coach, client, daysAgo, i } of plan) {
    const starts = new Date(Date.now() - daysAgo * DAY);
    const slot = must(await db.from("slots").insert({
      coach_id: coach.id, location: `${LOCATIONS.Default}, ${coach.coach.city}`, is_booked: true,
      starts_at: starts.toISOString(), ends_at: new Date(starts.getTime() + 3_600_000).toISOString(),
    }).select("id").single(), "past slot");
    const price = coach.coach.price;
    const paidAt = new Date(starts.getTime() - 3 * DAY).toISOString();
    const booking = must(await db.from("bookings").insert({
      slot_id: slot.id, coach_id: coach.id, client_id: client, price, insurance_fee: INSURANCE_FEE, status: "completed",
      created_at: paidAt, updated_at: starts.toISOString(),
    }).select("id").single(), "booking");
    await insertPayment({ client_id: client, slot_id: slot.id, booking_id: booking.id, price, status: "paid", at: paidAt });
    check(await db.from("reviews").insert({
      booking_id: booking.id, coach_id: coach.id, client_id: client,
      rating: i % 4 === 3 ? 4 : 5, comment: REVIEW_COMMENTS[i % REVIEW_COMMENTS.length],
    }), "review");
  }
  console.log("✔ 20 completed bookings with reviews");
}

/** Paid upcoming bookings (one confirmed, two awaiting the coach) and one refunded cancellation, so every dashboard has something to act on. */
async function seedUpcoming(amira: string, youssef: string, demoClient: string, leila: string) {
  const { count } = await db.from("bookings").select("id", { count: "exact", head: true }).in("status", ["pending", "confirmed"]);
  if (count) return console.log("• upcoming bookings already seeded");

  const plan = [
    { coach: amira, client: demoClient, status: "confirmed" as const, skip: 0 },
    { coach: youssef, client: demoClient, status: "pending" as const, skip: 0 },
    { coach: amira, client: leila, status: "pending" as const, skip: 2 },
    { coach: youssef, client: demoClient, status: "cancelled" as const, skip: 1 },
  ];
  for (const b of plan) {
    const slot = must(await db.from("slots").select("id").eq("coach_id", b.coach).eq("is_booked", false)
      .gt("starts_at", new Date().toISOString()).order("starts_at").range(b.skip, b.skip).single(), "upcoming slot");
    const offer = must(await db.from("offers").select("id, price").eq("coach_id", b.coach).eq("is_active", true)
      .order("price").limit(1).single(), "offer");
    const booking = must(await db.from("bookings").insert({
      slot_id: slot.id, coach_id: b.coach, client_id: b.client, offer_id: offer.id, price: offer.price, insurance_fee: INSURANCE_FEE, status: b.status,
    }).select("id").single(), "upcoming booking");
    const cancelled = b.status === "cancelled";
    if (!cancelled) check(await db.from("slots").update({ is_booked: true }).eq("id", slot.id), "book slot");
    await insertPayment({ client_id: b.client, slot_id: slot.id, booking_id: booking.id, price: offer.price,
      status: cancelled ? "refunded" : "paid", at: new Date(Date.now() - DAY).toISOString() });
  }
  console.log("✔ 3 upcoming paid bookings, 1 refunded cancellation");
}

async function main() {
  const admin = await ensureUser("admin@mawhiba.tn", "Admin Mawhiba", "client", "Tunis");
  check(await db.from("profiles").update({ role: "admin" }).eq("id", admin), "admin role");

  const demoClient = await ensureUser("client@mawhiba.tn", "Mehdi Client", "client", "Tunis");
  // Onboarding answers that make Amira the top match ("Pour vous").
  check(await db.from("client_preferences").upsert({
    user_id: demoClient, sports: ["Natation"], audience: "enfant", child_age: 8, level: "debutant", inclusive_needs: true,
    languages: ["Arabe", "Français"], city: "La Marsa", lat: 36.88, lng: 10.32, budget_max: 50, availability: ["weekend"],
    goals: ["Apprendre", "Confiance en soi"], onboarded_at: new Date().toISOString(),
  }), "client preferences");

  const verified = [await seedCoach(DEMO_COACH, true)];
  for (const coach of VERIFIED_COACHES) verified.push(await seedCoach(coach, true));
  for (const coach of PENDING_COACHES) await seedCoach(coach, false);
  console.log(`✔ ${verified.length} verified coaches, ${PENDING_COACHES.length} pending`);

  const inclusiveIds = verified.filter((v) => v.coach.inclusive).map((v) => v.id);
  await seedBadges(verified);
  await seedProfiles(verified, new Set(inclusiveIds));
  await seedFutureSlots(verified);

  const clients: string[] = [];
  for (const c of EXTRA_CLIENTS) clients.push(await ensureUser(c.email, c.name, "client", c.city));
  await seedHistory(verified, clients);
  await seedMarketplace(verified, { demoClient, clients });
  await seedUpcoming(verified[0].id, verified[1].id, demoClient, clients[0]);
  await seedEvents([...clients, ...verified.slice(1, 8).map((v) => v.id)]);

  console.log(`✔ Seed done. Demo accounts (password ${PASSWORD}): admin@ / coach@ / client@mawhiba.tn`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
