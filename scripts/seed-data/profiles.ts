import type { Database } from "../../src/lib/supabase/database.types";
import type { SeedCoach } from "./coaches";

type Level = Database["public"]["Enums"]["achievement_level"];
type Achievement = { year: number; title: string; competition: string; level: Level; result: string; verified?: boolean };

export const AMIRA = {
  tagline: "Ex-nageuse de l'équipe nationale, je rends l'eau rassurante pour tous",
  athlete_status: "retraite" as const,
  years_practice: 12,
  years_coaching: 4,
  highest_level: "international" as const,
  languages: ["Arabe", "Français", "Anglais"],
  specialties: ["Enfants", "Inclusif", "Débutants"],
  zones: ["La Marsa", "Tunis"],
  socials: { instagram: "amira.swim" },
  bio: "Nageuse de l'équipe nationale pendant six ans, spécialiste du dos, j'ai découvert le coaching en accompagnant les plus jeunes du Club Nautique de La Marsa.\n\nMa méthode : des séances structurées et prévisibles, des consignes simples et visuelles, et beaucoup d'encouragements. Je m'adapte au rythme de chacun.\n\nJ'accompagne enfants et adultes, du premier plongeon au perfectionnement, avec une attention particulière aux profils neuro-atypiques.",
  achievements: [
    { year: 2019, title: "Médaille d'or 200 m dos", competition: "Jeux panarabes", level: "international", result: "1re place", verified: true },
    { year: 2018, title: "Championne de Tunisie 100 m dos", competition: "Championnats nationaux open", level: "national", result: "Titre national", verified: true },
    { year: 2017, title: "Finaliste 100 m dos", competition: "Championnats d'Afrique", level: "international", result: "6e place" },
    { year: 2015, title: "Record régional 50 m dos", competition: "Championnat régional de Tunis", level: "regional", result: "Record" },
  ] satisfies Achievement[],
  experiences: [
    { role: "Entraîneure natation jeunes", organization: "Club Nautique de La Marsa", start_date: "2022-01-10", end_date: null,
      description: "Groupes 6–12 ans, de l'aisance aquatique aux premières compétitions." },
    { role: "Monitrice de natation", organization: "Camp d'été Hammamet Kids", start_date: "2021-07-01", end_date: "2021-08-31",
      description: "Encadrement de groupes de 8 enfants, sécurité et jeux aquatiques." },
  ],
  education: [{ degree: "Licence en sciences du sport", school: "ISSEP Ksar Saïd", year: 2021 }],
  certifications: [{ title: "Brevet de sauveteur aquatique et premiers secours", issuer: "Croissant-Rouge tunisien", year: 2022, verified: true }],
};

const SPECIALTIES_BY_SPORT: Record<string, string[]> = {
  Natation: ["Enfants", "Débutants", "Compétition"], Football: ["Enfants", "Compétition", "Préparation physique"],
  Tennis: ["Débutants", "Compétition", "Adolescents"], Boxe: ["Perte de poids", "Préparation physique", "Femmes"],
  "Athlétisme": ["Préparation physique", "Compétition", "Débutants"], Yoga: ["Seniors", "Rééducation", "Femmes"],
  Basketball: ["Adolescents", "Compétition", "Enfants"], Volleyball: ["Adolescents", "Débutants", "Compétition"],
  Taekwondo: ["Enfants", "Compétition", "Adolescents"], Judo: ["Enfants", "Femmes", "Compétition"],
  Handball: ["Compétition", "Adolescents", "Préparation physique"], Fitness: ["Perte de poids", "Seniors", "Femmes"],
};

function levelOf(text: string): Level {
  const t = text.toLowerCase();
  if (/(afrique|arabe|panarab|itf|international)/.test(t)) return "international";
  if (/(nationale|national|tunisie|ligue 1|ligue 2)/.test(t)) return "national";
  if (/(régional|regional|sahel|sfax)/.test(t)) return "regional";
  return "local";
}

/** Coherent, deterministic profile data. `tier` 0–3 controls how complete the profile is (strength ≈ 40% → 95%). */
export function profileFor(coach: SeedCoach, i: number) {
  const tier = i % 4;
  const sport = coach.sports[0];
  const parts = coach.achievements.split("·").map((s) => s.trim()).filter(Boolean);
  const achievements = parts.slice(0, tier === 0 ? 1 : 3).map((title, k) => ({
    year: 2021 - k * 2 - (i % 3), title, competition: "", level: levelOf(title), result: "", verified: tier >= 2 && k === 0,
  }));
  const levels: Level[] = ["local", "regional", "national", "international", "olympique"];
  const highest = achievements.reduce<Level>((best, a) => (levels.indexOf(a.level) > levels.indexOf(best) ? a.level : best), "local");
  return {
    scalars: {
      tagline: coach.headline,
      primary_sport: sport,
      athlete_status: (["actif", "retraite", "amateur"] as const)[i % 3],
      highest_level: highest,
      years_practice: 6 + (i % 10),
      years_coaching: tier >= 1 ? 1 + (i % 6) : null,
      languages: tier >= 1 ? ["Arabe", "Français", ...(i % 2 ? ["Anglais"] : [])] : [],
      specialties: tier >= 1 ? (SPECIALTIES_BY_SPORT[sport] ?? ["Débutants"]).slice(0, tier >= 2 ? 3 : 2) : [],
      zones: tier >= 2 ? [coach.city] : [],
      socials: tier >= 3 ? { instagram: coach.email.split("@")[0].replace(/\./g, "_") } : {},
      bio: tier >= 2 ? `${coach.bio} ${coach.headline}. Séances personnalisées, bilan à chaque étape et objectifs clairs pour progresser durablement.` : coach.bio,
      builder_step: tier >= 3 ? 7 : 2 + tier,
      published_at: tier >= 3 ? new Date().toISOString() : null,
    },
    achievements,
    experiences: tier >= 1 ? [{ role: `Coach ${sport.toLowerCase()}`, organization: `Club sportif de ${coach.city}`, start_date: `${2019 + (i % 4)}-09-01`, end_date: null as string | null, description: "" }] : [],
    education: tier >= 2 ? [{ degree: "Licence en sciences et techniques des activités physiques", school: "ISSEP Ksar Saïd", year: 2015 + (i % 6) }] : [],
    certifications: tier >= 3 ? [{ title: `Brevet d'entraîneur ${sport.toLowerCase()} 1er degré`, issuer: `Fédération tunisienne de ${sport.toLowerCase()}`, year: 2020, verified: false }] : [],
    cover: tier >= 3,
  };
}
