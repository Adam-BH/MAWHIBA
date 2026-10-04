"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fail, invalid, ok, type ActionResult } from "@/lib/action-result";
import { PROFILE_STEPS } from "@/lib/config";
import type { TablesUpdate } from "@/lib/supabase/database.types";
import { locationSchema, type LocationInput } from "@/lib/validations/location";
import { ALLOWED_TYPES, MAX_UPLOAD_BYTES } from "@/lib/validations/profile";
import {
  coachingInfoSchema, coachingStepSchema, identitySchema, publishSchema, sportStepSchema,
  type CoachingInfoInput, type CoachingStepInput, type IdentityInput, type PublishInput, type SportStepInput,
} from "@/lib/validations/profile-builder";

async function updateCoach(userId: string, values: TablesUpdate<"coach_profiles">) {
  const supabase = await createClient();
  return supabase.from("coach_profiles").update(values).eq("user_id", userId);
}

function done(): ActionResult {
  revalidatePath("/", "layout");
  return ok(null);
}

export async function saveIdentityAction(input: IdentityInput): Promise<ActionResult> {
  const user = await requireRole(["coach"]);
  const parsed = identitySchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0].message);
  const { fullName, city, tagline, slug, languages } = parsed.data;
  const supabase = await createClient();
  const { error: slugError } = await supabase
    .from("coach_profiles")
    .update({ slug, tagline: tagline || null, headline: tagline || null, languages })
    .eq("user_id", user.id);
  if (slugError) return fail(slugError.code === "23505" ? "SLUG_TAKEN" : slugError);
  const { error } = await supabase.from("profiles").update({ full_name: fullName, city: city || null }).eq("id", user.id);
  return error ? fail(error) : done();
}

export async function saveSportAction(input: SportStepInput): Promise<ActionResult> {
  const user = await requireRole(["coach"]);
  const parsed = sportStepSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0].message);
  const { primarySport, otherSports, athleteStatus, yearsPractice, highestLevel } = parsed.data;
  const { error } = await updateCoach(user.id, {
    primary_sport: primarySport,
    sports: [...new Set([primarySport, ...otherSports])],
    athlete_status: athleteStatus,
    years_practice: yearsPractice ?? null,
    highest_level: highestLevel,
  });
  return error ? fail(error) : done();
}

export async function saveCoachingInfoAction(input: CoachingInfoInput): Promise<ActionResult> {
  const user = await requireRole(["coach"]);
  const parsed = coachingInfoSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0].message);
  const { error } = await updateCoach(user.id, {
    years_coaching: parsed.data.yearsCoaching ?? null,
    specialties: [...new Set(parsed.data.specialties)],
  });
  return error ? fail(error) : done();
}

export async function saveCoachingStepAction(input: CoachingStepInput): Promise<ActionResult> {
  const user = await requireRole(["coach"]);
  const parsed = coachingStepSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0].message);
  const { bio, zones, videoUrl, socials, price, duration } = parsed.data;
  const supabase = await createClient();
  // With active offers, the "à partir de" price is derived from them (DB trigger).
  const { count: activeOffers } = await supabase
    .from("offers").select("id", { count: "exact", head: true }).eq("coach_id", user.id).eq("is_active", true);
  const handles = Object.fromEntries(Object.entries(socials).filter(([, v]) => v).map(([k, v]) => [k, v.replace(/^@/, "")]));
  const { error } = await updateCoach(user.id, {
    bio, zones, video_url: videoUrl || null, socials: handles, session_duration_min: duration,
    ...(activeOffers ? {} : { price_per_session: price }),
  });
  return error ? fail(error) : done();
}

/** Exact pin goes to the private `coach_locations`; a trigger publishes the rounded point. */
export async function updateCoachLocationAction(input: LocationInput): Promise<ActionResult> {
  const user = await requireRole(["coach"]);
  const parsed = locationSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0].message);
  const { point, label, radiusKm } = parsed.data;
  const supabase = await createClient();
  const { error: pinError } = point
    ? await supabase.from("coach_locations").upsert({ coach_id: user.id, ...point })
    : await supabase.from("coach_locations").delete().eq("coach_id", user.id);
  if (pinError) return fail(pinError);
  const { error } = await updateCoach(user.id, { base_label: label || null, service_radius_km: radiusKm });
  return error ? fail(error) : done();
}

export async function publishProfileAction(input: PublishInput): Promise<ActionResult> {
  const user = await requireRole(["coach"]);
  const parsed = publishSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0].message);
  const { error } = await updateCoach(user.id, {
    cv_template: parsed.data.cvTemplate, cv_public: parsed.data.cvPublic, published_at: new Date().toISOString(), builder_step: PROFILE_STEPS,
  });
  return error ? fail(error) : done();
}

/** Remembers the furthest step reached so the wizard resumes there. */
export async function reachStepAction(step: number): Promise<ActionResult> {
  const user = await requireRole(["coach"]);
  if (!Number.isInteger(step) || step < 1 || step > PROFILE_STEPS) return fail("NOT_FOUND");
  const supabase = await createClient();
  const { error } = await supabase.from("coach_profiles").update({ builder_step: step }).eq("user_id", user.id).lt("builder_step", step);
  return error ? fail(error) : ok(null);
}

export async function uploadCoverAction(formData: FormData): Promise<ActionResult> {
  const user = await requireRole(["coach"]);
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0 || file.size > MAX_UPLOAD_BYTES.proof || !ALLOWED_TYPES.avatar.includes(file.type)) {
    return fail("UPLOAD_INVALID");
  }
  const supabase = await createClient();
  const path = `${user.id}/cover-${Date.now()}.${file.type.split("/")[1]}`;
  const { error } = await supabase.storage.from("covers").upload(path, file, { contentType: file.type });
  if (error) return fail(error);
  const { error: updateError } = await updateCoach(user.id, { cover_path: path });
  return updateError ? fail(updateError) : done();
}
