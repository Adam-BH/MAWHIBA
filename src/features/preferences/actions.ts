"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fail, invalid, ok, type ActionResult } from "@/lib/action-result";
import { preferencesSchema, type PreferencesInput } from "@/lib/validations/preferences";

export async function savePreferencesAction(input: PreferencesInput): Promise<ActionResult> {
  const user = await requireRole(["client"]);
  const parsed = preferencesSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0].message);
  const p = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("client_preferences").upsert({
    user_id: user.id, sports: p.sports, audience: p.audience, child_age: p.childAge, level: p.level,
    inclusive_needs: p.inclusiveNeeds, languages: p.languages, city: p.city, lat: p.point?.lat ?? null, lng: p.point?.lng ?? null,
    budget_max: p.budgetMax, availability: p.availability, goals: p.goals, onboarded_at: new Date().toISOString(),
  });
  if (error) return fail(error);
  // Keeps the existing city-based features (dashboard, requests) in step.
  if (p.city) {
    const { error: cityError } = await supabase.from("profiles").update({ city: p.city }).eq("id", user.id);
    if (cityError) return fail(cityError);
  }
  revalidatePath("/", "layout");
  return ok(null);
}

/** "Passer": remembers the choice (no nudge loop) without touching existing answers. */
export async function skipOnboardingAction(): Promise<ActionResult> {
  const user = await requireRole(["client"]);
  const supabase = await createClient();
  const { error } = await supabase.from("client_preferences")
    .upsert({ user_id: user.id, onboarded_at: new Date().toISOString() }, { onConflict: "user_id", ignoreDuplicates: true });
  if (error) return fail(error);
  revalidatePath("/", "layout");
  return ok(null);
}
