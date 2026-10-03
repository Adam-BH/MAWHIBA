import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/features/auth/components/login-form";
import { getCurrentUser } from "@/lib/auth";

export async function generateMetadata() {
  const t = await getTranslations("auth");
  return { title: t("loginTitle") };
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const [{ next }, user, t] = await Promise.all([searchParams, getCurrentUser(), getTranslations("auth")]);
  if (user) redirect("/dashboard");
  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold">{t("loginTitle")}</h1>
      <p className="mb-6 text-sm text-muted-foreground">{t("loginSubtitle")}</p>
      <LoginForm next={next} />
    </>
  );
}
