"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { fail, invalid, ok, type ActionResult } from "@/lib/action-result";
import { initPayment, isMockGateway } from "@/lib/payments/konnect";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { bookingSchema, uuid } from "@/lib/validations/forms";

/** Holds the slot for 15 min and returns the gateway URL to send the client to. */
export async function startCheckoutAction(input: { slotId: string; offerId?: string; note?: string }): Promise<ActionResult<string>> {
  await requireRole(["client"]);
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0].message);
  const supabase = await createClient();
  const { slotId, offerId, note } = parsed.data;
  const { data, error } = await supabase.rpc("start_checkout", { slot_id: slotId, offer_id: offerId, note });
  if (error || !data) return fail(error);
  return ok(initPayment(data).payUrl);
}

export async function startProposalCheckoutAction(proposalId: string): Promise<ActionResult<string>> {
  await requireRole(["client"]);
  if (!uuid.safeParse(proposalId).success) return fail("NOT_FOUND");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("start_proposal_checkout", { proposal_id: proposalId });
  if (error || !data) return fail(error);
  return ok(initPayment(data).payUrl);
}

/**
 * Mock gateway only: plays Konnect's webhook. The client must own the payment (checked through RLS),
 * then the service role confirms it, exactly like the real webhook will.
 */
export async function mockGatewayAction(paymentId: string, success: boolean): Promise<ActionResult<{ booked: boolean }>> {
  await requireRole(["client"]);
  if (!isMockGateway || !uuid.safeParse(paymentId).success) return fail("NOT_FOUND");
  const supabase = await createClient();
  const { data: own } = await supabase.from("payments").select("id").eq("id", paymentId).maybeSingle();
  if (!own) return fail("NOT_FOUND");
  const { data, error } = await createAdminClient().rpc("confirm_payment", {
    payment_id: paymentId, success, provider_ref: `mock_${Date.now().toString(36)}`,
  });
  if (error) return fail(error);
  revalidatePath("/", "layout");
  return ok({ booked: !!data });
}
