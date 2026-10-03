"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fail, invalid, ok, type ActionResult } from "@/lib/action-result";
import {
  ALLOWED_TYPES, MAX_UPLOAD_BYTES, coachProfileSchema, profileSchema, type CoachProfileInput, type ProfileInput,
} from "@/lib/validations/profile";

export async function updateProfileAction(input: ProfileInput): Promise<ActionResult> {
  const user = await requireRole(["client", "coach", "admin"]);
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0].message);
  const supabase = await createClient();
  const { fullName, phone, city } = parsed.data;
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone: phone || null, city: city || null })
    .eq("id", user.id);
  if (error) return fail(error);
  revalidatePath("/", "layout");
  return ok(null);
}

export async function updateCoachProfileAction(input: CoachProfileInput): Promise<ActionResult> {
  const user = await requireRole(["coach"]);
  const parsed = coachProfileSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0].message);
  const { fullName, phone, city, sports, headline, bio, achievements, price, duration } = parsed.data;
  const supabase = await createClient();
  const [profileRes, coachRes] = await Promise.all([
    supabase.from("profiles").update({ full_name: fullName, phone: phone || null, city: city || null }).eq("id", user.id),
    supabase
      .from("coach_profiles")
      .update({ sports, headline, bio, achievements, price_per_session: price, session_duration_min: duration })
      .eq("user_id", user.id),
  ]);
  if (profileRes.error || coachRes.error) return fail(profileRes.error ?? coachRes.error);
  revalidatePath("/", "layout");
  return ok(null);
}

function validateFile(file: unknown, kind: "avatar" | "proof"): file is File {
  return file instanceof File && file.size > 0 && file.size <= MAX_UPLOAD_BYTES[kind] && ALLOWED_TYPES[kind].includes(file.type);
}

const EXT: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "application/pdf": "pdf" };

export async function uploadAvatarAction(formData: FormData): Promise<ActionResult<string>> {
  const user = await requireRole(["client", "coach", "admin"]);
  const file = formData.get("file");
  if (!validateFile(file, "avatar")) return fail("UPLOAD_INVALID");
  const supabase = await createClient();
  const path = `${user.id}/avatar.${EXT[file.type]}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
  if (error) return fail(error);
  const url = `${supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
  const { error: updateError } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
  if (updateError) return fail(updateError);
  revalidatePath("/", "layout");
  return ok(url);
}

export async function uploadProofAction(formData: FormData): Promise<ActionResult> {
  const user = await requireRole(["coach"]);
  const file = formData.get("file");
  if (!validateFile(file, "proof")) return fail("UPLOAD_INVALID");
  const supabase = await createClient();
  const path = `${user.id}/proof-${Date.now()}.${EXT[file.type]}`;
  const { error } = await supabase.storage.from("proofs").upload(path, file, { contentType: file.type });
  if (error) return fail(error);
  const { error: updateError } = await supabase.from("coach_profiles").update({ proof_path: path }).eq("user_id", user.id);
  if (updateError) return fail(updateError);
  revalidatePath("/", "layout");
  return ok(null);
}
