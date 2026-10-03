"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fail, invalid, ok, type ActionResult } from "@/lib/action-result";
import { quizSchema } from "@/lib/validations/forms";

export type QuizResult = { score: number; total: number; passed: boolean };

/** Scoring happens in SQL; the client only ever sends chosen option indexes. */
export async function submitQuizAction(input: { slug: string; answers: number[] }): Promise<ActionResult<QuizResult>> {
  await requireRole(["coach"]);
  const parsed = quizSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0].message);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_quiz", { slug: parsed.data.slug, answers: parsed.data.answers });
  if (error || !data) return fail(error);
  revalidatePath("/", "layout");
  return ok(data as QuizResult);
}
