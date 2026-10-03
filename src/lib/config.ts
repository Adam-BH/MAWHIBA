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
