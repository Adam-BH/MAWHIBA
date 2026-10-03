"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fail, invalid, ok, type ActionResult } from "@/lib/action-result";
import { uuid } from "@/lib/validations/forms";
import { proposalSchema, type ProposalInput } from "@/lib/validations/requests";

export async function createProposalAction(input: ProposalInput): Promise<ActionResult> {
  await requireRole(["coach"]);
  const t = await getTranslations("requests.validation");
  const parsed = proposalSchema(t("contact")).safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0].message);
  const supabase = await createClient();
  const { error } = await supabase.rpc("create_proposal", {
    request_id: parsed.data.requestId,
    slot_id: parsed.data.slotId,
    price: parsed.data.price,
    message: parsed.data.message,
  });
  if (error) return fail(error);
  revalidatePath("/", "layout");
  return ok(null);
}

export async function withdrawProposalAction(proposalId: string): Promise<ActionResult> {
  await requireRole(["coach"]);
  if (!uuid.safeParse(proposalId).success) return fail("NOT_FOUND");
  const supabase = await createClient();
  const { error } = await supabase.rpc("withdraw_proposal", { proposal_id: proposalId });
  if (error) return fail(error);
  revalidatePath("/", "layout");
  return ok(null);
}
