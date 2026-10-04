import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { DemoLogins } from "@/features/auth/components/demo-logins";
import { LoginForm } from "@/features/auth/components/login-form";
import { getCurrentUser } from "@/lib/auth";
import { isDemo } from "@/lib/demo";

export async function generateMetadata() {
  const t = await getTranslations("auth");
  return { title: t("loginTitle") };
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const [{ next }, user, t] = await Promise.all([searchParams, getCurrentUser(), getTranslations("auth")]);
  if (user) redirect("/dashboard");
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold">{t("loginTitle")}</h1>
      {isDemo && <DemoLogins />}
      <LoginForm next={next} />
    </>
  );
}
