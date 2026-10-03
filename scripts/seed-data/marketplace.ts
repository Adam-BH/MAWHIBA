import type { Database } from "../../src/lib/supabase/database.types";
import type { SeedCoach } from "./coaches";

type OfferRow = Omit<Database["public"]["Tables"]["offers"]["Insert"], "coach_id">;
type RequestRow = Omit<Database["public"]["Tables"]["requests"]["Insert"], "client_id">;

export const DEMO_COACH_OFFERS: OfferRow[] = [
  { title: "Natation enfants", sport: "Natation", duration_min: 45, price: 40, audience: "enfants", description: "Aisance aquatique, jeux et premières nages, en petits pas." },
  { title: "Natation adulte", sport: "Natation", duration_min: 60, price: 50, audience: "adultes", description: "Apprendre à nager ou perfectionner sa technique, sans pression." },
  { title: "Séance inclusive autisme", sport: "Natation", duration_min: 60, price: 50, audience: "tous", is_inclusive: true, description: "Séance structurée et prévisible, consignes visuelles, échange avec les parents." },
];

/** 1–3 offers per coach; the cheapest equals the coach's seeded price, so "à partir de" stays consistent. */
export function offersFor(coach: SeedCoach): OfferRow[] {
  const sport = coach.sports[0];
  const offers: OfferRow[] = [
    { title: `${sport} — séance découverte`, sport, duration_min: 60, price: coach.price, audience: "tous", description: "Bilan de niveau, objectifs et premiers exercices." },
  ];
  if (coach.price + 15 <= 80) {
    offers.push({ title: `${sport} — perfectionnement`, sport, duration_min: 75, price: coach.price + 15, audience: "adultes", description: "Technique avancée et plan de progression personnalisé." });
  }
  if (coach.inclusive) {
    offers.push({ title: "Séance inclusive (autisme)", sport, duration_min: 60, price: coach.price + 5, audience: "tous", is_inclusive: true, description: "Rythme adapté, routine rassurante et consignes visuelles." });
  }
  return offers;
}

export const DEMO_REQUEST: RequestRow = {
  sport: "Natation", city: "La Marsa", audience: "enfant", child_age: 8, level: "debutant",
  title: "Coach de natation pour mon fils autiste (8 ans)",
  description: "Mon fils adore l'eau mais n'a jamais pris de cours. Il a besoin d'un cadre calme et de consignes simples. Nous cherchons un suivi régulier.",
  special_needs: true, special_needs_note: "Autisme : besoin de routine et de consignes visuelles",
  schedule_note: "Samedi matin", budget_min: 30, budget_max: 50,
};

export const OTHER_REQUESTS: RequestRow[] = [
  { sport: "Tennis", city: "Ariana", audience: "adulte", level: "intermediaire", title: "Reprendre le tennis après 5 ans d'arrêt",
    description: "J'ai joué en club jusqu'à 25 ans. Je veux retrouver mon revers et un peu de cardio.", schedule_note: "En semaine après 18h", budget_min: 50, budget_max: 75 },
  { sport: "Football", city: "Sousse", audience: "enfant", child_age: 12, level: "intermediaire", title: "Entraînement technique pour mon fils de 12 ans",
    description: "Il joue en club et veut progresser en conduite de balle et en frappe.", schedule_note: "Mercredi après-midi", budget_min: 30, budget_max: 45 },
  { sport: "Yoga", city: "Ariana", audience: "adulte", level: "debutant", title: "Yoga doux pour débuter",
    description: "Je travaille assise toute la journée et j'aimerais gagner en souplesse.", schedule_note: "Dimanche matin", budget_min: 25, budget_max: 35 },
  { sport: "Boxe", city: "Sousse", audience: "adulte", level: "debutant", title: "Boxe pour se remettre en forme",
    description: "Objectif : perdre du poids et prendre confiance. Aucune expérience.", schedule_note: "Lundi et jeudi soir", budget_min: 35, budget_max: 50 },
  { sport: "Natation", city: "La Marsa", audience: "adulte", level: "debutant", title: "Apprendre à nager à 35 ans",
    description: "J'ai toujours eu peur de l'eau profonde. Je cherche un coach patient.", schedule_note: "Mardi et jeudi soir", budget_min: 40, budget_max: 60 },
];
