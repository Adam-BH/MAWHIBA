import "server-only";
import { createClient } from "@/lib/supabase/server";

/** The client's onboarding answers (owner-only by RLS), or null if never onboarded. */
export async function getMyPreferences(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("client_preferences").select("*").eq("user_id", userId).maybeSingle();
  return data;
}

export type Preferences = NonNullable<Awaited<ReturnType<typeof getMyPreferences>>>;
