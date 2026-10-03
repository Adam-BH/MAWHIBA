import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/layout/logo";
import { BrandLine } from "@/components/shared/brand-line";
import { InsuredBadge } from "@/components/shared/insured-badge";
import { Price } from "@/components/shared/price";
import { Stat } from "@/components/shared/stat";
import { insuredSessions } from "@/features/admin/components/metrics-grid";
import { getMetrics } from "@/features/admin/queries";
import { getStarTracks } from "@/features/star-tracks/queries";
import { requireRole } from "@/lib/auth";
import { COMMISSION_RATE, INSURANCE_FEE } from "@/lib/config";

export const metadata: Metadata = { title: "Star Tracks" };

/** Closing page of the pitch: the platform's insured activity on one screen. */
export default async function StarTracksPage() {
  await requireRole(["admin"]);
  const [t, metrics, tracks] = await Promise.all([getTranslations("starTracks"), getMetrics(), getStarTracks()]);
  const sessions = insuredSessions(metrics);
  const top = tracks.bySport[0]?.[1] ?? 1;

  return (
    <main className="page-enter mx-auto flex min-h-dvh max-w-5xl flex-col px-4 py-10 sm:px-8">
      <header className="flex items-center justify-between">
        <Logo href="/admin" />
        <InsuredBadge />
      </header>

      <section className="mt-16">
        <p className="text-sm font-semibold text-primary">Star Tracks</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold sm:text-6xl sm:leading-[1.05]">{t("headline", { count: sessions })}</h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">{t("subline", { fee: INSURANCE_FEE })}</p>
      </section>

      <section className="mt-14 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t("premiums")} value={<Price value={metrics.insurance} />} hint={t("premiumsHint")} />
        <Stat label={t("verifiedCoaches")} value={metrics.coaches_verified} />
        <Stat label={t("certifiedCoaches")} value={tracks.certifiedCoaches} hint={t("badges", { count: tracks.badges })} />
        <Stat label={t("coachEarnings")} value={<Price value={metrics.coach_due} />} hint={t("coachEarningsHint", { pct: Math.round((1 - COMMISSION_RATE) * 100) })} />
      </section>

      {tracks.bySport.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-4 text-xl font-semibold">{t("bySport")}</h2>
          <ul className="grid gap-3">
            {tracks.bySport.map(([sport, count], i) => (
              <li key={sport} className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-3 text-sm">
                <span className="truncate">{sport}</span>
                <span className="h-3 rounded-full bg-muted">
                  <span className={i === 0 ? "block h-full rounded-full bg-accent" : "block h-full rounded-full bg-primary"}
                    style={{ width: `${(count / top) * 100}%` }} />
                </span>
                <span className="text-end font-semibold">{count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="mt-auto pt-16">
        <BrandLine className="w-48 text-primary" />
        <p className="mt-4 max-w-xl font-display text-2xl font-semibold">{t("closing")}</p>
        <Link href="/admin" className="mt-6 inline-block text-sm font-semibold text-primary hover:underline">{t("back")}</Link>
      </footer>
    </main>
  );
}
