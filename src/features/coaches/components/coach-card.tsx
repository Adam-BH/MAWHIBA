import Link from "next/link";
import { BadgeCheck, HeartHandshake, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { LevelChip } from "@/components/shared/level-chip";
import { Price } from "@/components/shared/price";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { CoachCardData } from "@/features/coaches/queries";
import { athleteCardData } from "@/lib/athlete-card";

export function CoachCard({ coach }: { coach: CoachCardData }) {
  const t = useTranslations("coaches");
  const tb = useTranslations("badges");
  const card = athleteCardData(coach, 0, 100);
  return (
    <Link href={`/coaches/${coach.slug ?? coach.user_id}`}
      className="lift flex flex-col gap-4 rounded-3xl border bg-card p-5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
      <div className="flex items-center gap-3">
        <UserAvatar name={card.name} src={card.avatarUrl} className="size-14" />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-display text-lg font-semibold">
            <span className="truncate">{card.name}</span>
            {card.verified && <BadgeCheck className="size-4 shrink-0 text-primary" aria-label={tb("verified")} />}
          </p>
          <p className="truncate text-sm text-muted-foreground">{[card.sport, card.city].filter(Boolean).join(" · ")}</p>
        </div>
      </div>
      {card.tagline && <p className="line-clamp-2 text-sm">{card.tagline}</p>}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {card.level && <LevelChip level={card.level} />}
        {card.badges.includes("inclusive") && (
          <span className="flex items-center gap-1 font-semibold text-primary"><HeartHandshake className="size-3.5" />{tb("inclusive")}</span>
        )}
      </div>
      <div className="mt-auto flex items-center justify-between border-t pt-3 text-sm">
        <span className="flex items-center gap-1 text-muted-foreground">
          {card.ratingCount > 0 ? <><Star className="size-4 fill-primary text-primary" />{card.rating.toFixed(1)} ({card.ratingCount})</> : t("new")}
        </span>
        <span>{t("from")} <Price value={coach.price_per_session} /></span>
      </div>
    </Link>
  );
}
