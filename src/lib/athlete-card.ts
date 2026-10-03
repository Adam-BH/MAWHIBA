import type { AchievementLevel } from "@/lib/config";

const FAMILIES: Record<string, "aqua" | "combat" | "court" | "field" | "mind"> = {
  Natation: "aqua", Boxe: "combat", Taekwondo: "combat", Judo: "combat",
  Tennis: "court", Basketball: "court", Handball: "court", Volleyball: "court",
  Football: "field", "Athlétisme": "field", Fitness: "mind", Yoga: "mind",
};

export function sportFamily(sport: string | null | undefined) {
  return (sport && FAMILIES[sport]) || "field";
}

export type AthleteCardData = {
  name: string;
  avatarUrl: string | null;
  sport: string | null;
  city: string | null;
  level: AchievementLevel | null;
  verified: boolean;
  rating: number;
  ratingCount: number;
  sessions: number;
  years: number | null;
  badges: ("inclusive" | "complete" | "verified")[];
  tagline: string | null;
};

type CardSource = {
  verified: boolean;
  primary_sport: string | null;
  sports: string[];
  highest_level: AchievementLevel | null;
  years_practice: number | null;
  tagline: string | null;
  profile: { full_name: string; city: string | null; avatar_url: string | null };
  stats: { ratingAvg: number; ratingCount: number; completedSessions: number };
  inclusive: boolean;
};

/** Pure mapper so the wizard's live preview and the server pages render the same card. */
export function athleteCardData(c: CardSource, strengthScore: number, completeFrom: number): AthleteCardData {
  const badges: AthleteCardData["badges"] = [];
  if (c.verified) badges.push("verified");
  if (c.inclusive) badges.push("inclusive");
  if (strengthScore >= completeFrom) badges.push("complete");
  return {
    name: c.profile.full_name,
    avatarUrl: c.profile.avatar_url,
    sport: c.primary_sport ?? c.sports[0] ?? null,
    city: c.profile.city,
    level: c.highest_level,
    verified: c.verified,
    rating: c.stats.ratingAvg,
    ratingCount: c.stats.ratingCount,
    sessions: c.stats.completedSessions,
    years: c.years_practice,
    badges: badges.slice(0, 3),
    tagline: c.tagline,
  };
}
