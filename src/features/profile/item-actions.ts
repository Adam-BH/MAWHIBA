"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fail, invalid, ok, type ActionResult } from "@/lib/action-result";
import { uuid } from "@/lib/validations/forms";
import { ALLOWED_TYPES, MAX_UPLOAD_BYTES } from "@/lib/validations/profile";
import {
  achievementSchema, certificationSchema, educationSchema, experienceSchema,
  type AchievementInput, type CertificationInput, type EducationInput, type ExperienceInput,
} from "@/lib/validations/profile-builder";

const ITEM_TABLES = ["athletic_achievements", "coaching_experiences", "education", "external_certifications"] as const;
type ItemTable = (typeof ITEM_TABLES)[number];

async function finish(res: { error: { message: string } | null }): Promise<ActionResult> {
  if (res.error) return fail(res.error);
  revalidatePath("/", "layout");
  return ok(null);
}

export async function saveAchievementAction(input: AchievementInput, id?: string): Promise<ActionResult> {
  const user = await requireRole(["coach"]);
  const parsed = achievementSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0].message);
  if (id && !uuid.safeParse(id).success) return fail("NOT_FOUND");
  const supabase = await createClient();
  return finish(id
    ? await supabase.from("athletic_achievements").update(parsed.data).eq("id", id).eq("coach_id", user.id)
    : await supabase.from("athletic_achievements").insert({ ...parsed.data, coach_id: user.id, sort: Date.now() % 1_000_000_000 }));
}

export async function reorderAchievementsAction(ids: string[]): Promise<ActionResult> {
  const user = await requireRole(["coach"]);
  if (ids.length > 50 || !ids.every((id) => uuid.safeParse(id).success)) return fail("NOT_FOUND");
  const supabase = await createClient();
  const results = await Promise.all(
    ids.map((id, sort) => supabase.from("athletic_achievements").update({ sort }).eq("id", id).eq("coach_id", user.id)),
  );
  return finish(results.find((r) => r.error) ?? { error: null });
}

export async function saveExperienceAction(input: ExperienceInput, id?: string): Promise<ActionResult> {
  const user = await requireRole(["coach"]);
  const parsed = experienceSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0].message);
  if (id && !uuid.safeParse(id).success) return fail("NOT_FOUND");
  const { role, organization, startDate, endDate, description } = parsed.data;
  const row = { role, organization, start_date: startDate, end_date: endDate || null, description };
  const supabase = await createClient();
  return finish(id
    ? await supabase.from("coaching_experiences").update(row).eq("id", id).eq("coach_id", user.id)
    : await supabase.from("coaching_experiences").insert({ ...row, coach_id: user.id }));
}

export async function saveEducationAction(input: EducationInput, id?: string): Promise<ActionResult> {
  const user = await requireRole(["coach"]);
  const parsed = educationSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0].message);
  if (id && !uuid.safeParse(id).success) return fail("NOT_FOUND");
  const supabase = await createClient();
  return finish(id
    ? await supabase.from("education").update(parsed.data).eq("id", id).eq("coach_id", user.id)
    : await supabase.from("education").insert({ ...parsed.data, coach_id: user.id }));
}

export async function saveCertificationAction(input: CertificationInput, id?: string): Promise<ActionResult> {
  const user = await requireRole(["coach"]);
  const parsed = certificationSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0].message);
  if (id && !uuid.safeParse(id).success) return fail("NOT_FOUND");
  const supabase = await createClient();
  return finish(id
    ? await supabase.from("external_certifications").update(parsed.data).eq("id", id).eq("coach_id", user.id)
    : await supabase.from("external_certifications").insert({ ...parsed.data, coach_id: user.id }));
}

export async function deleteItemAction(table: ItemTable, id: string): Promise<ActionResult> {
  const user = await requireRole(["coach"]);
  if (!ITEM_TABLES.includes(table) || !uuid.safeParse(id).success) return fail("NOT_FOUND");
  const supabase = await createClient();
  return finish(await supabase.from(table).delete().eq("id", id).eq("coach_id", user.id));
}

/** Proof for an achievement or certification → private `proofs` bucket; resets "Vérifié" until an admin reviews it. */
export async function uploadItemProofAction(formData: FormData): Promise<ActionResult> {
  const user = await requireRole(["coach"]);
  const kind = formData.get("kind");
  const id = String(formData.get("id"));
  const file = formData.get("file");
  if ((kind !== "achievement" && kind !== "certification") || !uuid.safeParse(id).success) return fail("NOT_FOUND");
  if (!(file instanceof File) || file.size === 0 || file.size > MAX_UPLOAD_BYTES.proof || !ALLOWED_TYPES.proof.includes(file.type)) {
    return fail("UPLOAD_INVALID");
  }
  const supabase = await createClient();
  const path = `${user.id}/${kind}-${id}-${Date.now()}.${file.type === "application/pdf" ? "pdf" : file.type.split("/")[1]}`;
  const { error } = await supabase.storage.from("proofs").upload(path, file, { contentType: file.type });
  if (error) return fail(error);
  return finish(kind === "achievement"
    ? await supabase.from("athletic_achievements").update({ proof_path: path }).eq("id", id).eq("coach_id", user.id)
    : await supabase.from("external_certifications").update({ file_path: path }).eq("id", id).eq("coach_id", user.id));
}
