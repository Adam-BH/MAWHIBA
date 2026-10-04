export const COMMISSION_RATE = 0.15;
export const INSURANCE_FEE = 2;
export const SPORTS = ["Football", "Basketball", "Natation", "Tennis", "Boxe", "Taekwondo", "Judo", "Athlétisme", "Fitness", "Yoga", "Handball", "Volleyball"] as const;
export const CITIES = ["Tunis", "Ariana", "Ben Arous", "La Marsa", "Sousse", "Sfax", "Monastir", "Nabeul", "Bizerte"] as const;

export const TIME_ZONE = "Africa/Tunis";
export const INCLUSIVE_CERT_SLUG = "coaching-inclusif-autisme";

export type Sport = (typeof SPORTS)[number];

export const MAX_ACTIVE_OFFERS = 6;
export const MAX_OPEN_REQUESTS = 3;
export const OFFER_AUDIENCES = ["tous", "enfants", "adultes"] as const;
export const REQUEST_AUDIENCES = ["enfant", "adulte"] as const;
export const SKILL_LEVELS = ["debutant", "intermediaire", "avance"] as const;

export const ACHIEVEMENT_LEVELS = ["local", "regional", "national", "international", "olympique"] as const;
export const ATHLETE_STATUSES = ["actif", "retraite", "amateur"] as const;
export const LANGUAGES = ["Arabe", "Français", "Anglais", "Italien", "Allemand", "Espagnol"] as const;
export const SPECIALTIES = [
  "Enfants", "Débutants", "Compétition", "Préparation physique", "Perte de poids", "Seniors", "Inclusif", "Rééducation", "Femmes", "Adolescents",
] as const;
export const SOCIAL_NETWORKS = ["instagram", "facebook", "tiktok", "linkedin"] as const;
export const CV_TEMPLATES = ["moderne", "classique"] as const;
export const PROFILE_STEPS = 7;
export const BIO_MAX = 1200;

export type AchievementLevel = (typeof ACHIEVEMENT_LEVELS)[number];
export type CvTemplate = (typeof CV_TEMPLATES)[number];
export type SocialNetwork = (typeof SOCIAL_NETWORKS)[number];

export type City = (typeof CITIES)[number];
/** City centroids [lat, lng], used for map quick-jumps and as a fallback point. */
export const CITY_COORDS: Record<City, [number, number]> = {
  Tunis: [36.8065, 10.1815],
  Ariana: [36.8665, 10.1647],
  "Ben Arous": [36.7531, 10.2189],
  "La Marsa": [36.8782, 10.3247],
  Sousse: [35.8256, 10.636],
  Sfax: [34.7406, 10.7603],
  Monastir: [35.7643, 10.8113],
  Nabeul: [36.4561, 10.7376],
  Bizerte: [37.2744, 9.8739],
};
export const MAP_DEFAULT_CENTER: [number, number] = CITY_COORDS.Tunis;
export const MAP_DEFAULT_ZOOM = 11;
/** Swap in a paid tile provider for production via NEXT_PUBLIC_MAP_TILE_URL. */
export const MAP_TILE_URL = process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const MAP_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

export const GOALS = ["Apprendre", "Progresser", "Compétition", "Forme & santé", "Perte de poids", "Confiance en soi"] as const;
export const AVAILABILITY = ["matin", "midi", "soir", "weekend"] as const;
export const MAX_PREF_SPORTS = 3;
export const MAX_PREF_GOALS = 4;
export const PREF_BUDGET = { min: 20, max: 150, default: 60 } as const;

/** Reason codes returned by the matching RPCs, in display priority. Mirror of SQL `match_reason_codes()`. */
export const MATCH_REASONS = ["sport", "inclusive", "nearby", "kids", "goals", "in_budget", "level", "language", "top_rated"] as const;
export type MatchReason = (typeof MATCH_REASONS)[number];
