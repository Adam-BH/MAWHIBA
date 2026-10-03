"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fail, invalid, ok, type ActionResult } from "@/lib/action-result";
import { TOPUP_PACKS, type TopupPackId } from "@/lib/config";
import { withdrawalSchema, type WithdrawalInput } from "@/lib/validations/forms";

/** Mock Flouci payment: always succeeds, then credits the pack through the ledger RPC. */
export async function topupAction(packId: TopupPackId): Promise<ActionResult<number>> {
  await requireRole(["client"]);
  if (!TOPUP_PACKS.some((p) => p.id === packId)) return fail("INVALID_PACK");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("topup_wallet", { pack_id: packId });
  if (error) return fail(error);
  revalidatePath("/", "layout");
  return ok(data);
}

export async function requestWithdrawalAction(input: WithdrawalInput): Promise<ActionResult> {
  await requireRole(["coach"]);
  const parsed = withdrawalSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0].message);
  const supabase = await createClient();
  const { error } = await supabase.rpc("request_withdrawal", { amount: parsed.data.amount });
  if (error) return fail(error);
  revalidatePath("/", "layout");
  return ok(null);
}
