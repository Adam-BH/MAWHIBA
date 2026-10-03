import { Award, Briefcase, Globe, GraduationCap, MapPin, PlayCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AchievementsTimeline } from "@/features/cv/components/achievements-timeline";
import type { CoachFull } from "@/features/cv/queries";
import { SOCIAL_NETWORKS, type SocialNetwork } from "@/lib/config";
import { formatLongDate } from "@/lib/dates";

const SOCIAL_URLS: Record<SocialNetwork, (h: string) => string> = {
  instagram: (h) => `https://instagram.com/${h}`,
  facebook: (h) => `https://facebook.com/${h}`,
  tiktok: (h) => `https://tiktok.com/@${h}`,
  linkedin: (h) => `https://linkedin.com/in/${h}`,
};

function Block({ id, title, icon: Icon, children }: { id: string; title: string; icon: typeof Award; children: React.ReactNode }) {
  return (
    <Card id={id} className="scroll-mt-20">
      <CardHeader><CardTitle className="flex items-center gap-2"><Icon className="size-5 text-primary" />{title}</CardTitle></CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/** À propos, Palmarès, Expérience, Certifications & badges. */
export function ProfileSections({ coach }: { coach: CoachFull }) {
  const t = useTranslations("publicProfile");
  const socials = SOCIAL_NETWORKS.filter((n) => coach.socials[n]);
  return (
    <>
      <Block id="a-propos" title={t("about")} icon={Globe}>
        {coach.bio && <p className="whitespace-pre-line text-muted-foreground">{coach.bio}</p>}
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          {coach.languages.length > 0 && <div><dt className="font-medium">{t("languages")}</dt><dd className="text-muted-foreground">{coach.languages.join(", ")}</dd></div>}
          {coach.zones.length > 0 && <div><dt className="font-medium">{t("zones")}</dt><dd className="flex items-center gap-1 text-muted-foreground"><MapPin className="size-3.5" />{coach.zones.join(", ")}</dd></div>}
          {coach.specialties.length > 0 && (
            <div className="sm:col-span-2"><dt className="font-medium">{t("specialties")}</dt>
              <dd className="mt-1 flex flex-wrap gap-1">{coach.specialties.map((s) => <span key={s} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-primary">{s}</span>)}</dd></div>
          )}
        </dl>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          {coach.video_url && <a href={coach.video_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-medium text-primary underline"><PlayCircle className="size-4" />{t("video")}</a>}
          {socials.map((n) => (
            <a key={n} href={SOCIAL_URLS[n](coach.socials[n] ?? "")} target="_blank" rel="noreferrer" className="text-primary underline">{t(`socials.${n}`)} @{coach.socials[n]}</a>
          ))}
        </div>
      </Block>
      {coach.achievements.length > 0 && <Block id="palmares" title={t("achievements")} icon={Award}><AchievementsTimeline achievements={coach.achievements} /></Block>}
      {coach.experiences.length > 0 && (
        <Block id="experience" title={t("experience")} icon={Briefcase}>
          <ul className="flex flex-col gap-3">
            {coach.experiences.map((e) => (
              <li key={e.id}>
                <p className="font-medium">{e.role} · <span className="text-primary">{e.organization}</span></p>
                <p className="text-sm text-muted-foreground">{e.start_date.slice(0, 4)} – {e.end_date ? e.end_date.slice(0, 4) : t("today")}</p>
                {e.description && <p className="text-sm">{e.description}</p>}
              </li>
            ))}
          </ul>
        </Block>
      )}
      {(coach.stats.badges.length > 0 || coach.certifications.length > 0 || coach.education.length > 0) && (
        <Block id="certifications" title={t("certifications")} icon={GraduationCap}>
          <ul className="flex flex-col gap-2 text-sm">
            {coach.stats.badges.map((b) => (
              <li key={b.slug}><span className="font-medium">{b.title}</span> <span className="text-success">· {t("issuedByMawhiba", { date: formatLongDate(b.completed_at) })}</span></li>
            ))}
            {coach.certifications.map((c) => (
              <li key={c.id}><span className="font-medium">{c.title}</span> <span className="text-muted-foreground">· {c.issuer}, {c.year}</span>
                {c.verified && <span className="font-semibold text-success"> · {t("verified")}</span>}</li>
            ))}
            {coach.education.map((e) => <li key={e.id}><span className="font-medium">{e.degree}</span> <span className="text-muted-foreground">· {e.school}, {e.year}</span></li>)}
          </ul>
        </Block>
      )}
    </>
  );
}
