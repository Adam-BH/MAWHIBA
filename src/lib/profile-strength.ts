/** Inputs for the profile strength score. Counts come from the structured CV tables. */
export type StrengthInput = {
  avatar: boolean;
  cover: boolean;
  tagline: boolean;
  city: boolean;
  languages: number;
  primarySport: boolean;
  athleteStatus: boolean;
  yearsPractice: boolean;
  highestLevel: boolean;
  achievements: number;
  verifiedAchievements: number;
  experiences: number;
  yearsCoaching: boolean;
  specialties: number;
  education: number;
  certifications: number;
  mawhibaBadges: number;
  bioLength: number;
  zones: number;
  location: boolean;
  video: boolean;
  socials: number;
};

export type StrengthKey =
  | "avatar" | "cover" | "tagline" | "languages" | "city" | "primarySport" | "athleteStatus" | "yearsPractice" | "highestLevel"
  | "achievements" | "verifiedAchievement" | "experience" | "yearsCoaching" | "specialties" | "education" | "certification"
  | "mawhibaBadge" | "bio" | "zones" | "location" | "video" | "socials";

export type StrengthHint = { key: StrengthKey; gain: number; count?: number };

// Each rule: [hint key, points earned, max points]. Weights sum to 100.
function rules(p: StrengthInput): [StrengthKey, number, number, number?][] {
  const achievementPts = p.achievements >= 3 ? 15 : p.achievements * 5;
  const bioPts = p.bioLength >= 150 ? 8 : p.bioLength >= 50 ? 4 : 0;
  return [
    ["avatar", p.avatar ? 10 : 0, 10],
    ["cover", p.cover ? 4 : 0, 4],
    ["tagline", p.tagline ? 5 : 0, 5],
    ["languages", p.languages > 0 ? 3 : 0, 3],
    ["city", p.city ? 2 : 0, 2],
    ["primarySport", p.primarySport ? 5 : 0, 5],
    ["athleteStatus", p.athleteStatus ? 3 : 0, 3],
    ["yearsPractice", p.yearsPractice ? 3 : 0, 3],
    ["highestLevel", p.highestLevel ? 4 : 0, 4],
    ["achievements", achievementPts, 15, Math.max(0, 3 - p.achievements)],
    ["verifiedAchievement", p.verifiedAchievements > 0 ? 5 : 0, 5],
    ["experience", p.experiences > 0 ? 8 : 0, 8],
    ["yearsCoaching", p.yearsCoaching ? 2 : 0, 2],
    ["specialties", p.specialties >= 2 ? 5 : 0, 5],
    ["education", p.education > 0 ? 4 : 0, 4],
    ["certification", p.certifications > 0 ? 3 : 0, 3],
    ["mawhibaBadge", p.mawhibaBadges > 0 ? 3 : 0, 3],
    ["bio", bioPts, 8],
    ["zones", p.zones > 0 ? 2 : 0, 2],
    ["location", p.location ? 2 : 0, 2],
    ["video", p.video ? 2 : 0, 2],
    ["socials", p.socials > 0 ? 2 : 0, 2],
  ];
}

export type StrengthLevel = "debutant" | "solide" | "pro" | "elite";

export function strengthLevel(score: number): StrengthLevel {
  return score >= 90 ? "elite" : score >= 70 ? "pro" : score >= 40 ? "solide" : "debutant";
}

/** Score 0-100, its level, and the missing item worth the most points. */
export function profileStrength(input: StrengthInput) {
  const all = rules(input);
  const score = all.reduce((sum, [, pts]) => sum + pts, 0);
  const missing = all
    .map(([key, pts, max, count]) => ({ key, gain: max - pts, count }))
    .filter((r) => r.gain > 0)
    .sort((a, b) => b.gain - a.gain)[0];
  return { score, level: strengthLevel(score), next: (missing ?? null) as StrengthHint | null };
}

export const STRENGTH_NUDGE_BELOW = 60;
export const STRENGTH_COMPLETE_FROM = 80;
