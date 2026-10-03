"use server";

import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { getCoachFull } from "@/features/cv/queries";
import { isAiBioEnabled } from "@/features/profile/ai-flag";

const Suggestions = z.object({ bios: z.array(z.string()).length(2) });

const SYSTEM = `Tu rédiges des bios de coachs sportifs pour MAWHIBA, une plateforme tunisienne.
Écris en français, à la première personne ("Je…").
Chaque bio fait 60 à 110 mots, ton chaleureux et professionnel, sans emoji, sans hashtag.
N'invente aucun fait : utilise uniquement les données fournies. N'ajoute ni téléphone, ni e-mail, ni lien.
Propose deux variantes différentes : l'une centrée sur le parcours, l'autre sur la méthode et le public.`;

/** "Améliorer ma bio": 2 suggestions; the coach picks, edits or ignores them. Off unless flagged on. */
export async function suggestBioAction(currentBio: string): Promise<ActionResult<string[]>> {
  const user = await requireRole(["coach"]);
  if (!isAiBioEnabled()) return fail("NOT_FOUND");
  const supabase = await createClient();
  const { data: allowed } = await supabase.rpc("consume_ai_bio_quota");
  if (!allowed) return fail("AI_QUOTA");

  const coach = await getCoachFull(user.id);
  if (!coach) return fail("NOT_FOUND");
  const facts = {
    nom: coach.profile.full_name, ville: coach.profile.city, sport: coach.primary_sport, autres_sports: coach.sports,
    statut: coach.athlete_status, niveau_max: coach.highest_level, annees_pratique: coach.years_practice,
    annees_coaching: coach.years_coaching, specialites: coach.specialties, langues: coach.languages,
    palmares: coach.achievements.map((a) => `${a.year} — ${a.title}${a.result ? ` (${a.result})` : ""}`),
    experiences: coach.experiences.map((e) => `${e.role}, ${e.organization}`),
    formation: coach.education.map((e) => `${e.degree}, ${e.school}`),
    bio_actuelle: currentBio.slice(0, 1200),
  };

  try {
    const client = new Anthropic({ timeout: 20_000, maxRetries: 1 });
    const response = await client.beta.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 2000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: betaZodOutputFormat(Suggestions) },
      system: SYSTEM,
      messages: [{ role: "user", content: `Données du coach (JSON) :\n${JSON.stringify(facts)}` }],
    });
    if (response.stop_reason === "refusal" || !response.parsed_output) return fail("AI_UNAVAILABLE");
    return ok(response.parsed_output.bios.map((b) => b.trim().slice(0, 1200)));
  } catch (error) {
    console.error("suggestBioAction", error instanceof Anthropic.APIError ? `${error.status} ${error.message}` : error);
    return fail("AI_UNAVAILABLE");
  }
}
