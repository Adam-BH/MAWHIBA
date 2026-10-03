import { BadgeCheck, HeartHandshake, MapPin, Sparkles, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { LevelChip } from "@/components/shared/level-chip";
import { UserAvatar } from "@/components/shared/user-avatar";
import { sportFamily, type AthleteCardData } from "@/lib/athlete-card";
import { cn } from "@/lib/utils";

const BADGE_ICONS = { verified: BadgeCheck, inclusive: HeartHandshake, complete: Sparkles };

/** Original "athlete card": sport-tinted gradient, level chip, 3 stats, top badges. */
export function AthleteCard({ card, variant = "full", className }: { card: AthleteCardData; variant?: "full" | "compact"; className?: string }) {
  const t = useTranslations("athleteCard");
  const compact = variant === "compact";
  const stats = [
    { label: t("rating"), value: card.ratingCount ? card.rating.toFixed(1) : "—" },
    { label: t("sessions"), value: card.sessions },
    { label: t("years"), value: card.years ?? "—" },
  ];

  return (
    <div
      className={cn(
        "relative overflow-hidden text-primary-foreground shadow-lg",
        "bg-[linear-gradient(150deg,var(--card-from)_0%,var(--primary)_75%)]",
        compact ? "rounded-3xl p-4" : "rounded-4xl p-6",
        className,
      )}
      style={{ "--card-from": `var(--sport-${sportFamily(card.sport)})` } as React.CSSProperties}
    >
      <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full border-[24px] border-primary-foreground/10" />
      {card.verified && (
        <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-primary-foreground/15 px-2 py-0.5 text-xs font-semibold backdrop-blur">
          <BadgeCheck className="size-3.5" />{t("verified")}
        </span>
      )}
      <div className={cn("flex gap-4", compact ? "items-center" : "flex-col items-center text-center")}>
        <UserAvatar name={card.name} src={card.avatarUrl}
          className={cn("ring-4 ring-primary-foreground/30", compact ? "size-14" : "size-28 text-2xl")} />
        <div className="min-w-0">
          <p className={cn("font-display font-semibold tracking-tight", compact ? "truncate text-lg" : "text-2xl")}>{card.name || t("yourName")}</p>
          <p className="flex items-center gap-1 text-sm text-primary-foreground/80 max-sm:flex-wrap" >
            {card.sport ?? t("sport")}
            {card.city && <><span aria-hidden>·</span><MapPin className="size-3.5" />{card.city}</>}
          </p>
          {!compact && card.tagline && <p className="mt-2 text-sm text-primary-foreground/90 italic">« {card.tagline} »</p>}
          {card.level && <LevelChip level={card.level} className="mt-2" />}
        </div>
      </div>
      <dl className={cn("grid grid-cols-3 gap-2", compact ? "mt-3" : "mt-5")}>
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-primary-foreground/10 px-2 py-1.5 text-center">
            <dd className={cn("font-display font-semibold", compact ? "text-base" : "text-xl")}>
              {s.label === t("rating") && card.ratingCount > 0 && <Star className="mr-0.5 mb-0.5 inline size-3.5 fill-accent text-accent" />}
              {s.value}
            </dd>
            <dt className="text-[11px] tracking-wide text-primary-foreground/70 uppercase">{s.label}</dt>
          </div>
        ))}
      </dl>
      {card.badges.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {card.badges.map((b) => {
            const Icon = BADGE_ICONS[b];
            return (
              <li key={b} className="flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                <Icon className="size-3.5" />{t(`badges.${b}`)}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
