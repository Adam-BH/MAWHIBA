"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fail, invalid, ok, type ActionResult } from "@/lib/action-result";
import { loginSchema, signupSchema, type LoginInput, type SignupInput } from "@/lib/validations/auth";

function safeNext(next?: string) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export async function signInAction(input: LoginInput, next?: string): Promise<ActionResult<string>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0].message);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return fail("INVALID_CREDENTIALS");
  return ok(safeNext(next));
}

export async function signUpAction(input: SignupInput, next?: string): Promise<ActionResult<string>> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error.issues[0].message);
  const { email, password, fullName, role } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role } },
  });
  if (error) return fail(error.code === "user_already_exists" ? "EMAIL_TAKEN" : error.message);
  if (!data.session) return fail("CONFIRM_EMAIL");
  return ok(role === "coach" ? "/profile" : safeNext(next));
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
