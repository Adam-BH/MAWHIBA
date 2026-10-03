import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SignupForm } from "@/features/auth/components/signup-form";
import { getCurrentUser } from "@/lib/auth";

export async function generateMetadata() {
  const t = await getTranslations("auth");
  return { title: t("signupTitle") };
}

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string; role?: string }> }) {
  const [{ next, role }, user, t] = await Promise.all([searchParams, getCurrentUser(), getTranslations("auth")]);
  if (user) redirect("/dashboard");
  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold">{t("signupTitle")}</h1>
      <p className="mb-6 text-sm text-muted-foreground">{t("signupSubtitle")}</p>
      <SignupForm next={next} defaultRole={role === "coach" ? "coach" : "client"} />
    </>
  );
}
