import { THEME } from "../src/features/cv/pdf/theme";
import { sportFamily } from "../src/lib/athlete-card";
import { profileStrength } from "../src/lib/profile-strength";
import type { SeedCoach } from "./seed-data/coaches";
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

    const { count } = await db.from("athletic_achievements").select("id", { count: "exact", head: true }).eq("coach_id", id);
    if (!count) await insertItems(id, sport, p, i === 1 ? "achievement" : i === 2 ? "achievement+cert" : "none");

    const s = p.scalars;
    scores.push(profileStrength({
      avatar: true, cover: !!cover_path, tagline: !!s.tagline, city: true, languages: s.languages.length, primarySport: true,
      athleteStatus: true, yearsPractice: true, highestLevel: true, achievements: p.achievements.length,
      verifiedAchievements: p.achievements.filter((a) => a.verified).length, experiences: p.experiences.length,
      yearsCoaching: s.years_coaching !== null, specialties: s.specialties.length, education: p.education.length,
      certifications: p.certifications.length, mawhibaBadges: inclusiveIds.has(id) ? 1 : 0, bioLength: s.bio.length,
      zones: s.zones.length, video: false, socials: Object.keys(s.socials).length,
    }).score);
  }
  console.log(`✔ coach profiles & CVs (strength ${Math.min(...scores)}-${Math.max(...scores)}%, Amira ${scores[0]}%)`);
}
