import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/layout/logo";
import { OnboardingWizard } from "@/features/preferences/components/onboarding-wizard";
import { getMyPreferences } from "@/features/preferences/queries";
import { requireRole, safeNext } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("onboarding");
  return { title: t("metaTitle") };
}

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ next?: string; edit?: string }> }) {
  const user = await requireRole(["client"]);
  const [{ next, edit }, prefs] = await Promise.all([searchParams, getMyPreferences(user.id)]);
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-8 px-4 py-8 sm:py-12">
      <Logo href="/dashboard" />
      <OnboardingWizard prefs={prefs} city={user.city} next={safeNext(next)} edit={edit === "1"} />
    </main>
  );
}
