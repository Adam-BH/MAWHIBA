import { DEMO_COACH, EXTRA_CLIENTS, LOCATIONS, PENDING_COACHES, REVIEW_COMMENTS, VERIFIED_COACHES, type SeedCoach } from "./seed-data/coaches";
import { INCLUSIVE_CERTIFICATION } from "./seed-data/certification";
import { check, db, must } from "./seed-data/db";
import { seedMarketplace } from "./seed-marketplace";
import { seedProfiles } from "./seed-profiles";

const PASSWORD = "Mawhiba2026!";
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

async function seedCertification(inclusiveCoachIds: string[]) {
  const cert = must(
    await db.from("certifications").upsert(INCLUSIVE_CERTIFICATION, { onConflict: "slug" }).select("id").single(),
    "certification",
  );
  const rows = inclusiveCoachIds.map((coach_id) => ({ coach_id, certification_id: cert.id, score: 5, passed: true }));
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

async function credit(owner_id: string, amount: number, reason: string) {
  check(await db.from("wallet_tx").insert({ owner_id, amount, type: "admin_credit", meta: { reason, seed: true } }), "credit");
}

async function seedHistory(coaches: { id: string; coach: SeedCoach }[], clients: { id: string; balance: number }[]) {
  const { count } = await db.from("bookings").select("id", { count: "exact", head: true }).eq("status", "completed");
  if (count) return console.log("• history already seeded");

  const spent = new Map<string, number>();
  const plan = Array.from({ length: 20 }, (_, i) => ({
    coach: coaches[i % coaches.length], client: clients[i % clients.length], daysAgo: 2 + i, i,
  }));
  for (const { coach, client } of plan) spent.set(client.id, (spent.get(client.id) ?? 0) + coach.coach.price + 2);
  for (const client of clients) await credit(client.id, client.balance + (spent.get(client.id) ?? 0), "Dépôt en espèces");

  for (const { coach, client, daysAgo, i } of plan) {
    const starts = new Date(Date.now() - daysAgo * DAY);
    const slot = must(await db.from("slots").insert({
      coach_id: coach.id, location: `${LOCATIONS.Default}, ${coach.coach.city}`, is_booked: true,
      starts_at: starts.toISOString(), ends_at: new Date(starts.getTime() + 3_600_000).toISOString(),
    }).select("id").single(), "past slot");
    const price = coach.coach.price;
    const booking = must(await db.from("bookings").insert({
      slot_id: slot.id, coach_id: coach.id, client_id: client.id, price, insurance_fee: 2, status: "completed",
      created_at: new Date(starts.getTime() - 3 * DAY).toISOString(), updated_at: starts.toISOString(),
    }).select("id").single(), "booking");
    const [split] = must(await db.rpc("split_payout", { p_price: price }), "split");
    check(await db.from("wallet_tx").insert([
      { owner_id: client.id, amount: -(price + 2), type: "booking_hold", booking_id: booking.id },
      { owner_id: coach.id, amount: split.coach, type: "coach_payout", booking_id: booking.id },
      { system_account: "PLATFORM", amount: split.platform, type: "commission", booking_id: booking.id },
      { system_account: "STAR_INSURANCE", amount: split.star, type: "insurance", booking_id: booking.id },
    ]), "ledger");
    check(await db.from("reviews").insert({
      booking_id: booking.id, coach_id: coach.id, client_id: client.id,
      rating: i % 4 === 3 ? 4 : 5, comment: REVIEW_COMMENTS[i % REVIEW_COMMENTS.length],
    }), "review");
  }
  console.log("✔ 20 completed bookings with reviews");
}

async function main() {
  const admin = await ensureUser("admin@mawhiba.tn", "Admin Mawhiba", "client", "Tunis");
  check(await db.from("profiles").update({ role: "admin" }).eq("id", admin), "admin role");

  const demoClient = await ensureUser("client@mawhiba.tn", "Mehdi Client", "client", "Tunis");
  const { count: demoTx } = await db.from("wallet_tx").select("id", { count: "exact", head: true }).eq("owner_id", demoClient);
  if (!demoTx) await credit(demoClient, 150, "Crédit de bienvenue");

  const verified = [await seedCoach(DEMO_COACH, true)];
  for (const coach of VERIFIED_COACHES) verified.push(await seedCoach(coach, true));
  for (const coach of PENDING_COACHES) await seedCoach(coach, false);
  console.log(`✔ ${verified.length} verified coaches, ${PENDING_COACHES.length} pending`);

  const inclusiveIds = verified.filter((v) => v.coach.inclusive).map((v) => v.id);
  await seedCertification(inclusiveIds);
  await seedProfiles(verified, new Set(inclusiveIds));
  await seedFutureSlots(verified);

  const clients = [];
  for (const c of EXTRA_CLIENTS) clients.push({ id: await ensureUser(c.email, c.name, "client", c.city), balance: c.balance });
  await seedHistory(verified, clients);
  await seedMarketplace(verified, { demoClient, clients: clients.map((c) => c.id) });

  console.log(`✔ Seed done. Demo accounts (password ${PASSWORD}): admin@ / coach@ / client@mawhiba.tn`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
