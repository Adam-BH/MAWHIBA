import { BadgeCheck, HeartHandshake, MapPin, Sparkles, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { LevelChip } from "@/components/shared/level-chip";
import { UserAvatar } from "@/components/shared/user-avatar";
import { sportFamily, type AthleteCardData } from "@/lib/athlete-card";
import { cn } from "@/lib/utils";

const BADGE_ICONS = { verified: BadgeCheck, inclusive: HeartHandshake, complete: Sparkles };

/** The coach's shareable identity: one purple surface, the sport as a coloured dot, three stats. */
export function AthleteCard({ card, className }: { card: AthleteCardData; className?: string }) {
  const t = useTranslations("athleteCard");
  const stats = [
    { label: t("rating"), value: card.ratingCount ? card.rating.toFixed(1) : "-", star: card.ratingCount > 0 },
    { label: t("sessions"), value: card.sessions, star: false },
    { label: t("years"), value: card.years ?? "-", star: false },
  ];

  return (
    <div className={cn("rounded-4xl bg-primary p-6 text-primary-foreground", className)}>
      <div className="flex flex-col items-center text-center">
        <UserAvatar name={card.name} src={card.avatarUrl} className="size-24 text-2xl" />
        <p className="mt-4 font-display text-2xl font-semibold">{card.name || t("yourName")}</p>
        <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-sm text-primary-foreground/80">
          <span aria-hidden className="size-2 rounded-full" style={{ background: `var(--sport-${sportFamily(card.sport)})` }} />
          {card.sport ?? t("sport")}
          {card.city && <><span aria-hidden>·</span><MapPin className="size-3.5" />{card.city}</>}
        </p>
        {card.tagline && <p className="mt-3 text-sm text-primary-foreground/90">« {card.tagline} »</p>}
        {card.level && <LevelChip level={card.level} className="mt-3" />}
      </div>
      <dl className="mt-6 grid grid-cols-3 divide-x divide-primary-foreground/20 border-y border-primary-foreground/20 py-3 rtl:divide-x-reverse">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col-reverse items-center">
            <dt className="text-xs text-primary-foreground/70">{s.label}</dt>
            <dd className="flex items-center gap-1 font-display text-xl font-semibold">
              {s.star && <Star className="size-4 fill-accent text-accent" />}{s.value}
            </dd>
          </div>
        ))}
      </dl>
      {card.badges.length > 0 && (
        <ul className="mt-4 flex flex-wrap justify-center gap-1.5">
          {card.badges.map((b) => {
            const Icon = BADGE_ICONS[b];
            return (
              <li key={b} className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                <Icon className="size-3.5" />{t(`badges.${b}`)}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
