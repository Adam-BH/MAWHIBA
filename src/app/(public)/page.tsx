import Link from "next/link";
import { CalendarCheck, Search, ShieldCheck, Trophy } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { CoachCard } from "@/features/coaches/components/coach-card";
import { listCoaches } from "@/features/coaches/queries";
import { EventCard } from "@/features/events/components/event-card";
import { getNextEvent } from "@/features/events/queries";
import { getCurrentUser } from "@/lib/auth";
import { INSURANCE_FEE } from "@/lib/config";

export default async function LandingPage() {
  const user = await getCurrentUser();
  const [t, te, coaches, event] = await Promise.all([
    getTranslations("landing"), getTranslations("events"), listCoaches({}, 6), getNextEvent(user?.id),
  ]);
  const steps = [
    { icon: Search, title: t("step1Title"), text: t("step1Text") },
    { icon: CalendarCheck, title: t("step2Title"), text: t("step2Text") },
    { icon: Trophy, title: t("step3Title"), text: t("step3Text") },
  ];

  return (
    <div className="flex flex-col gap-14">
      <section className="relative overflow-hidden rounded-4xl bg-primary px-6 [--ring:var(--accent)] py-12 text-primary-foreground sm:px-12 sm:py-16">
        <div className="absolute -top-16 -end-16 size-64 rounded-full bg-accent/30 blur-3xl" aria-hidden />
        <p className="mb-3 text-sm font-semibold tracking-wide text-accent uppercase">{t("eyebrow")}</p>
        <h1 className="max-w-2xl text-4xl font-semibold sm:text-5xl">{t("heroTitle")}</h1>
        <p className="mt-4 max-w-xl text-primary-foreground/80">{t("heroText")}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" variant="accent">
            <Link href="/signup?role=client">{t("ctaClient")}</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
            <Link href="/signup?role=coach">{t("ctaCoach")}</Link>
          </Button>
        </div>
      </section>

      {event && (
        <section>
          <h2 className="text-2xl font-semibold">{te("sectionTitle")}</h2>
          <p className="mt-1 mb-6 max-w-2xl text-muted-foreground">{te("sectionText")}</p>
          <EventCard event={event} viewer={user?.role ?? null} />
        </section>
      )}

      <section>
        <h2 className="mb-6 text-2xl font-semibold">{t("howTitle")}</h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="rounded-4xl border bg-card p-6">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground">{i + 1}</span>
                <Icon className="size-5 text-primary" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold">{t("featuredTitle")}</h2>
          <div className="flex flex-wrap justify-end">
            <Button asChild variant="link"><Link href="/explore/offers">{t("seeOffers")}</Link></Button>
            <Button asChild variant="link"><Link href="/coaches">{t("seeAll")}</Link></Button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coaches.map((coach) => <CoachCard key={coach.user_id} coach={coach} />)}
        </div>
      </section>

      <section className="flex flex-col items-start gap-4 rounded-3xl border-2 border-success/30 bg-success/10 p-6 sm:flex-row sm:items-center sm:p-8">
        <ShieldCheck className="size-12 shrink-0 text-success" />
        <div>
          <h2 className="text-xl font-semibold">{t("starTitle")}</h2>
          <p className="mt-1 text-muted-foreground">{t("starText", { fee: INSURANCE_FEE })}</p>
        </div>
      </section>
    </div>
  );
}
