import "server-only";
import { createClient } from "@/lib/supabase/server";

// Never select answer_key: API roles have no privilege on it anyway.
const CERT_FIELDS = "id, slug, title, description, lessons, quiz, pass_score";

export type Lesson = { title: string; body: string[] };
export type QuizQuestion = { question: string; options: string[] };

export async function listCertifications(coachId: string) {
  const supabase = await createClient();
  const [{ data: certs }, { data: mine }] = await Promise.all([
    supabase.from("certifications").select(CERT_FIELDS).order("title"),
    supabase.from("coach_certifications").select("certification_id, score, passed").eq("coach_id", coachId),
  ]);
  const status = new Map((mine ?? []).map((m) => [m.certification_id, m]));
  return (certs ?? []).map((c) => ({
    ...c,
    lessonCount: (c.lessons as Lesson[]).length,
    status: status.get(c.id) ?? null,
  }));
}

export async function getCertification(slug: string, coachId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("certifications").select(CERT_FIELDS).eq("slug", slug).maybeSingle();
  if (!data) return null;
  const { data: mine } = await supabase
    .from("coach_certifications")
    .select("score, passed")
    .eq("coach_id", coachId)
    .eq("certification_id", data.id)
    .maybeSingle();
  return { ...data, lessons: data.lessons as Lesson[], quiz: data.quiz as QuizQuestion[], status: mine };
}
