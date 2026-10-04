import { THEME } from "../src/features/cv/pdf/theme";
import { sportFamily } from "../src/lib/athlete-card";
import { profileStrength } from "../src/lib/profile-strength";
import { CITY_COORDS, type City } from "../src/lib/config";
import { LOCATIONS, type SeedCoach } from "./seed-data/coaches";
import { coverPng } from "./seed-data/cover-png";
import { check, db } from "./seed-data/db";
import { AMIRA, profileFor } from "./seed-data/profiles";

type Coach = { id: string; coach: SeedCoach };
type Profile = ReturnType<typeof profileFor>;
const PDF = "%PDF-1.1\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n";

function amiraProfile(): Profile {
  const { achievements, experiences, education, certifications, ...scalars } = AMIRA;
  return {
    scalars: { ...scalars, primary_sport: "Natation", builder_step: 7, published_at: new Date().toISOString() },
    achievements: achievements.map((a) => ({ ...a, verified: a.verified ?? false })),
    experiences, education, certifications, cover: true,
  };
}

async function upload(bucket: "covers" | "proofs", path: string, body: Buffer | string, contentType: string) {
  check(await db.storage.from(bucket).upload(path, body, { contentType, upsert: true }), `upload ${path}`);
  return path;
}

async function insertItems(id: string, sport: string, p: Profile, queue: "none" | "achievement" | "achievement+cert") {
  const achievements = p.achievements.map((a, sort) => ({ ...a, coach_id: id, sport, sort, proof_path: null as string | null }));
  if (queue !== "none") {
    achievements.push({ year: 2016, title: "Sélection en équipe régionale", competition: "Coupe inter-régions", level: "regional", result: "Demi-finale",
      verified: false, coach_id: id, sport, sort: achievements.length, proof_path: await upload("proofs", `${id}/achievement-seed.pdf`, PDF, "application/pdf") });
  }
  check(await db.from("athletic_achievements").insert(achievements), "achievements");
  if (p.experiences.length) check(await db.from("coaching_experiences").insert(p.experiences.map((e, sort) => ({ ...e, coach_id: id, sort }))), "experiences");
  if (p.education.length) check(await db.from("education").insert(p.education.map((e) => ({ ...e, coach_id: id }))), "education");
  const certs = p.certifications.map((c) => ({ ...c, coach_id: id, file_path: null as string | null }));
  if (queue === "achievement+cert") {
    certs.push({ title: "Diplôme d'éducateur sportif", issuer: "Ministère de la Jeunesse et des Sports", year: 2019, verified: false, coach_id: id,
      file_path: await upload("proofs", `${id}/certification-seed.pdf`, PDF, "application/pdf") });
  }
  if (certs.length) check(await db.from("external_certifications").insert(certs), "certifications");
}

/** Deterministic pin within ±0.02° of the coach's city (Amira: her club in La Marsa). */
async function seedPin(id: string, coach: SeedCoach, i: number) {
  const [lat, lng] = CITY_COORDS[coach.city as City];
  const jitter = (k: number) => ((((i + 1) * k) % 41) - 20) / 1000;
  const pin = i === 0 ? { lat: 36.8885, lng: 10.3305 } : { lat: lat + jitter(17), lng: lng + jitter(29) };
  const base_label = i === 0 ? "Club Nautique de La Marsa" : `${LOCATIONS[coach.sports[0]] ?? LOCATIONS.Default}, ${coach.city}`;
  check(await db.from("coach_locations").upsert({ coach_id: id, ...pin }), "coach pin");
  check(await db.from("coach_profiles").update({ base_label, service_radius_km: i === 0 ? 8 : 5 + (i % 4) * 5 }).eq("user_id", id), "coach place");
}

/** Profile builder data. Scalars are re-applied on every run; CV items are inserted once per coach. */
export async function seedProfiles(verified: Coach[], inclusiveIds: Set<string>) {
  const scores: number[] = [];
  for (const [i, { id, coach }] of verified.entries()) {
    const p = i === 0 ? amiraProfile() : profileFor(coach, i);
    const sport = coach.sports[0];
    const cover_path = p.cover
      ? await upload("covers", `${id}/cover-seed.png`, coverPng(THEME.sport[sportFamily(sport)], THEME.colors.primary), "image/png")
      : null;
    check(await db.from("coach_profiles").update({ ...p.scalars, cover_path, cv_template: "moderne", cv_public: true }).eq("user_id", id), "coach scalars");
    await seedPin(id, coach, i);

    const { count } = await db.from("athletic_achievements").select("id", { count: "exact", head: true }).eq("coach_id", id);
    if (!count) await insertItems(id, sport, p, i === 1 ? "achievement" : i === 2 ? "achievement+cert" : "none");

    const s = p.scalars;
    scores.push(profileStrength({
      avatar: true, cover: !!cover_path, tagline: !!s.tagline, city: true, languages: s.languages.length, primarySport: true,
      athleteStatus: true, yearsPractice: true, highestLevel: true, achievements: p.achievements.length,
      verifiedAchievements: p.achievements.filter((a) => a.verified).length, experiences: p.experiences.length,
      yearsCoaching: s.years_coaching !== null, specialties: s.specialties.length, education: p.education.length,
      certifications: p.certifications.length, mawhibaBadges: inclusiveIds.has(id) ? 1 : 0, bioLength: s.bio.length,
      zones: s.zones.length, location: true, video: false, socials: Object.keys(s.socials).length,
    }).score);
  }
  console.log(`✔ coach profiles & CVs (strength ${Math.min(...scores)}-${Math.max(...scores)}%, Amira ${scores[0]}%)`);
}
