import { BadgeCheck, CalendarCheck, Star, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { LevelChip } from "@/components/shared/level-chip";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { CoachFull } from "@/features/cv/queries";
import { formatLongDate, formatMonthYear } from "@/lib/dates";
import { siteUrl } from "@/lib/storage-url";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="break-inside-avoid">
      <h2 className="mb-2 border-b-2 border-accent pb-1 text-sm font-bold tracking-wider text-primary uppercase">{title}</h2>
      {children}
    </section>
  );
}

function Verified({ label }: { label: string }) {
  return <span className="ml-1 inline-flex items-center gap-0.5 text-[11px] font-semibold text-success"><BadgeCheck className="size-3" />{label}</span>;
}

/** One-page printable CV. Contact = booking link on MAWHIBA, never phone/e-mail. */
export function CvSheet({ coach, qr }: { coach: CoachFull; qr: string }) {
  const t = useTranslations("cv");
  const s = coach.stats;
  const years = (start: string, end: string | null) => `${start.slice(0, 4)} – ${end ? end.slice(0, 4) : t("today")}`;

  return (
    <article className="cv-sheet mx-auto w-full max-w-[210mm] bg-card text-foreground shadow-sm print:shadow-none">
      <header className="flex flex-col gap-4 bg-primary p-6 text-primary-foreground sm:flex-row sm:items-center print:flex-row print:items-center">
        <UserAvatar name={coach.profile.full_name} src={coach.profile.avatar_url} className="size-24 ring-4 ring-primary-foreground/20" />
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-extrabold">{coach.profile.full_name}</h1>
          {coach.tagline && <p className="mt-1 text-primary-foreground/85 italic">{coach.tagline}</p>}
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            {[coach.primary_sport ?? coach.sports[0], coach.profile.city, coach.athlete_status && t(`status.${coach.athlete_status}`)].filter(Boolean).join(" · ")}
            {coach.highest_level && <LevelChip level={coach.highest_level} />}
          </p>
          <a href={siteUrl(`/coaches/${coach.slug}`)} className="mt-2 inline-block rounded-full bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground">
            {t("bookOn")}
          </a>
        </div>
      </header>

      <div className="grid gap-6 p-6 sm:grid-cols-[1fr_220px] print:grid-cols-[1fr_200px]">
        <div className="flex flex-col gap-5">
          {coach.bio && <Section title={t("summary")}><p className="text-sm leading-relaxed whitespace-pre-line">{coach.bio}</p></Section>}
          {coach.achievements.length > 0 && (
            <Section title={t("achievements")}>
              <ul className="flex flex-col gap-2 text-sm">
                {coach.achievements.map((a) => (
                  <li key={a.id} className="grid grid-cols-[3rem_1fr] gap-2">
                    <span className="font-bold text-primary">{a.year}</span>
                    <span>
                      <span className="font-semibold">{a.title}</span>{a.result && ` — ${a.result}`}
                      {a.verified && <Verified label={t("verified")} />}
                      {a.competition && <span className="block text-muted-foreground">{a.competition} · {t(`levels.${a.level}`)}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {coach.experiences.length > 0 && (
            <Section title={t("experience")}>
              <ul className="flex flex-col gap-3 text-sm">
                {coach.experiences.map((e) => (
                  <li key={e.id}>
                    <p><span className="font-semibold">{e.role}</span> · {e.organization} <span className="text-muted-foreground">({years(e.start_date, e.end_date)})</span></p>
                    {e.description && <p className="text-muted-foreground">{e.description}</p>}
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {coach.education.length > 0 && (
            <Section title={t("education")}>
              <ul className="flex flex-col gap-1 text-sm">
                {coach.education.map((e) => <li key={e.id}><span className="font-semibold">{e.degree}</span> · {e.school} ({e.year})</li>)}
              </ul>
            </Section>
          )}
        </div>

        <aside className="flex flex-col gap-5">
          <Section title={t("activity")}>
            <ul className="flex flex-col gap-1.5 text-sm">
              <li className="flex items-center gap-2"><CalendarCheck className="size-4 text-primary" />{t("sessions", { count: s.completedSessions })}</li>
              <li className="flex items-center gap-2"><Users className="size-4 text-primary" />{t("clients", { count: s.distinctClients })}</li>
              <li className="flex items-center gap-2"><Star className="size-4 fill-primary text-primary" />
                {s.ratingCount ? t("rating", { rating: s.ratingAvg.toFixed(1), count: s.ratingCount }) : t("noRating")}</li>
              <li className="text-muted-foreground">{t("memberSince", { date: formatMonthYear(s.memberSince) })}</li>
            </ul>
            <p className="mt-1"><Verified label={t("verifiedData")} /></p>
          </Section>
          {(s.badges.length > 0 || coach.certifications.length > 0) && (
            <Section title={t("certifications")}>
              <ul className="flex flex-col gap-2 text-sm">
                {s.badges.map((b) => (
                  <li key={b.slug}>
                    <span className="font-semibold">{b.title}</span>
                    <span className="block text-xs text-success">{t("issuedByMawhiba", { date: formatLongDate(b.completed_at) })}</span>
                  </li>
                ))}
                {coach.certifications.map((c) => (
                  <li key={c.id}><span className="font-semibold">{c.title}</span>{c.verified && <Verified label={t("verified")} />}
                    <span className="block text-xs text-muted-foreground">{c.issuer} · {c.year}</span></li>
                ))}
              </ul>
            </Section>
          )}
          {coach.languages.length > 0 && <Section title={t("languages")}><p className="text-sm">{coach.languages.join(" · ")}</p></Section>}
          {coach.specialties.length > 0 && (
            <Section title={t("specialties")}>
              <ul className="flex flex-wrap gap-1">
                {coach.specialties.map((sp) => <li key={sp} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-primary">{sp}</li>)}
              </ul>
            </Section>
          )}
          <div className="mt-auto flex flex-col items-center gap-1 text-center">
            <div className="size-28 [&_svg]:size-full" dangerouslySetInnerHTML={{ __html: qr }} />
            <p className="text-[11px] text-muted-foreground">{t("qrHint")}</p>
          </div>
        </aside>
      </div>
      <footer className="border-t px-6 py-3 text-center text-xs text-muted-foreground">
        {t("generated", { date: formatLongDate(new Date()) })} · {siteUrl(`/cv/${coach.slug}`).replace(/^https?:\/\//, "")}
      </footer>
    </article>
  );
}
