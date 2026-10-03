"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fail, invalid, ok, type ActionResult } from "@/lib/action-result";
import { uuid } from "@/lib/validations/forms";
import { requestSchema, type RequestInput } from "@/lib/validations/requests";

export async function createRequestAction(input: RequestInput): Promise<ActionResult<string>> {
  await requireRole(["client"]);
  const t = await getTranslations("requests.validation");
  const parsed = requestSchema({ contact: t("contact"), budget: t("budget"), childAge: t("childAge") }).safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0].message);
  const r = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_request", {
    sport: r.sport,
    city: r.city,
    title: r.title,
    description: r.description,
    audience: r.audience,
    child_age: r.childAge ?? 0, // ignored by the RPC for adults
    level: r.level,
    special_needs: r.specialNeeds,
    special_needs_note: r.specialNeedsNote,
    schedule_note: r.scheduleNote,
    budget_min: r.budget.min,
    budget_max: r.budget.max,
  });
  if (error) return fail(error);
  revalidatePath("/", "layout");
  return ok(data);
}

export async function closeRequestAction(requestId: string): Promise<ActionResult> {
  await requireRole(["client", "admin"]);
  if (!uuid.safeParse(requestId).success) return fail("NOT_FOUND");
  const supabase = await createClient();
  const { error } = await supabase.rpc("close_request", { request_id: requestId });
  if (error) return fail(error);
  revalidatePath("/", "layout");
  return ok(null);
}
