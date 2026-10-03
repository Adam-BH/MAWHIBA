export const COMMISSION_RATE = 0.15;
export const INSURANCE_FEE = 2;
export const TOPUP_PACKS = [
  { id: "p50", pay: 50, points: 50 },
  { id: "p100", pay: 100, points: 110 },
  { id: "p200", pay: 200, points: 230 },
] as const;
export const SPORTS = ["Football", "Basketball", "Natation", "Tennis", "Boxe", "Taekwondo", "Judo", "Athlétisme", "Fitness", "Yoga", "Handball", "Volleyball"] as const;
export const CITIES = ["Tunis", "Ariana", "Ben Arous", "La Marsa", "Sousse", "Sfax", "Monastir", "Nabeul", "Bizerte"] as const;

export const TIME_ZONE = "Africa/Tunis";
export const INCLUSIVE_CERT_SLUG = "coaching-inclusif-autisme";

export type TopupPackId = (typeof TOPUP_PACKS)[number]["id"];
export type Sport = (typeof SPORTS)[number];

export const MAX_ACTIVE_OFFERS = 6;
export const MAX_OPEN_REQUESTS = 3;
export const OFFER_AUDIENCES = ["tous", "enfants", "adultes"] as const;
export const REQUEST_AUDIENCES = ["enfant", "adulte"] as const;
export const SKILL_LEVELS = ["debutant", "intermediaire", "avance"] as const;
