"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fail, invalid, ok, type ActionResult } from "@/lib/action-result";
import { creditSchema, uuid, type CreditInput } from "@/lib/validations/forms";

export async function setCoachVerifiedAction(coachId: string, verified: boolean): Promise<ActionResult> {
  await requireRole(["admin"]);
  if (!uuid.safeParse(coachId).success) return fail("NOT_FOUND");
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_coach_verified", { coach_id: coachId, verified });
  if (error) return fail(error);
  revalidatePath("/", "layout");
  return ok(null);
}

export async function processWithdrawalAction(withdrawalId: string, approve: boolean): Promise<ActionResult> {
  await requireRole(["admin"]);
  if (!uuid.safeParse(withdrawalId).success) return fail("NOT_FOUND");
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_process_withdrawal", { id: withdrawalId, approve });
  if (error) return fail(error);
  revalidatePath("/", "layout");
  return ok(null);
}

export async function adminCreditAction(input: CreditInput): Promise<ActionResult> {
  await requireRole(["admin"]);
  const parsed = creditSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0].message);
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_credit", {
    user_id: parsed.data.userId,
    amount: parsed.data.amount,
    reason: parsed.data.reason,
  });
  if (error) return fail(error);
  revalidatePath("/", "layout");
  return ok(null);
}

export async function verifyCvItemAction(kind: "achievement" | "certification", id: string, verified: boolean): Promise<ActionResult> {
  await requireRole(["admin"]);
  if ((kind !== "achievement" && kind !== "certification") || !uuid.safeParse(id).success) return fail("NOT_FOUND");
  const supabase = await createClient();
  const { error } = kind === "achievement"
    ? await supabase.rpc("admin_verify_achievement", { id, verified })
    : await supabase.rpc("admin_verify_certification", { id, verified });
  if (error) return fail(error);
  revalidatePath("/", "layout");
  return ok(null);
}
