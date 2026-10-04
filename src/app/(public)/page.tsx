import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { BrandLine } from "@/components/shared/brand-line";
import { InsuredBadge } from "@/components/shared/insured-badge";
import { Section } from "@/components/shared/section";
import { CoachCard } from "@/features/coaches/components/coach-card";
import { listCoachPins, listCoaches } from "@/features/coaches/queries";
import { EventCard } from "@/features/events/components/event-card";
import { getNextEvent } from "@/features/events/queries";
import { CoachMiniMap } from "@/features/map/components/coach-mini-map";
import { getCurrentUser } from "@/lib/auth";
import { INSURANCE_FEE, MAP_DEFAULT_CENTER } from "@/lib/config";

export default async function LandingPage() {
  const user = await getCurrentUser();
  const [t, te, coaches, event, pins] = await Promise.all([
    getTranslations("landing"), getTranslations("events"), listCoaches({}, 6), getNextEvent(user?.id), listCoachPins(),
  ]);
  const steps = [[t("step1Title"), t("step1Text")], [t("step2Title"), t("step2Text")], [t("step3Title"), t("step3Text")]];
  const linkClass = "text-sm font-semibold text-primary hover:underline";

  return (
    <>
      <section className="relative overflow-hidden rounded-4xl bg-primary px-6 py-14 text-primary-foreground [--ring:var(--accent)] sm:px-14 sm:py-20">
        <p className="text-sm font-semibold text-accent">{t("eyebrow")}</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold sm:text-6xl sm:leading-[1.05]">
          {t("heroTitle")} <span className="text-accent">{t("heroAccent")}</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-primary-foreground/85">{t("heroText")}</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" variant="accent"><Link href="/signup?role=client">{t("ctaClient")}</Link></Button>
          <Button asChild size="lg" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
            <Link href="/signup?role=coach">{t("ctaCoach")}</Link>
          </Button>
        </div>
        <BrandLine className="pointer-events-none absolute -end-6 bottom-6 hidden w-[28rem] text-accent lg:block" />
      </section>

      {event && (
        <Section title={te("sectionTitle")} className="mt-16">
          <p className="-mt-2 mb-6 max-w-2xl text-muted-foreground">{te("sectionText")}</p>
          <EventCard event={event} viewer={user?.role ?? null} />
        </Section>
      )}

      <section className="mt-16 grid gap-8 lg:grid-cols-[1fr_2fr]">
        <h2 className="text-3xl font-semibold">{t("howTitle")}</h2>
        <ol className="divide-y border-y">
          {steps.map(([title, text], i) => (
            <li key={title} className="grid grid-cols-[3rem_1fr] gap-4 py-6">
              <span className="font-display text-3xl font-semibold text-primary">{i + 1}</span>
              <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-1 text-muted-foreground">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <Section title={t("featuredTitle")} className="mt-16" action={<Link href="/coaches" className={linkClass}>{t("seeAll")}</Link>}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coaches.map((coach) => <CoachCard key={coach.user_id} coach={coach} />)}
        </div>
      </Section>

      <Section title={t("mapTitle")} className="mt-16" action={<Link href="/coaches?view=map" className={linkClass}>{t("mapCta")}</Link>}>
        <p className="-mt-2 mb-6 max-w-2xl text-muted-foreground">{t("mapText", { count: pins.length })}</p>
        <CoachMiniMap label={t("mapCta")} center={MAP_DEFAULT_CENTER} zoom={7} markers={pins} />
      </Section>

      <section className="mt-16 flex flex-col gap-3 border-t pt-8 sm:flex-row sm:items-center sm:gap-6">
        <InsuredBadge className="self-start sm:self-auto" />
        <p className="text-muted-foreground"><span className="font-semibold text-foreground">{t("starTitle")}.</span> {t("starText", { fee: INSURANCE_FEE })}</p>
      </section>
    </>
  );
}
