import Link from "next/link";
import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { CoachBadges } from "@/components/shared/coach-badges";
import { Points } from "@/components/shared/points";
import { RatingStars } from "@/components/shared/rating-stars";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { CoachCardData } from "@/features/coaches/queries";

export function CoachCard({ coach }: { coach: CoachCardData }) {
  const t = useTranslations("coaches");
  return (
    <Link href={`/coaches/${coach.user_id}`} className="group block rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50 outline-none">
      <Card className="h-full transition-shadow group-hover:shadow-md">
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <UserAvatar name={coach.profile.full_name} src={coach.profile.avatar_url} className="size-14" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{coach.profile.full_name}</p>
              <p className="text-sm text-muted-foreground">{coach.sports.join(" · ")}</p>
              {coach.profile.city && (
                <p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-3.5" />{coach.profile.city}</p>
              )}
            </div>
          </div>
          {coach.headline && <p className="line-clamp-2 text-sm">{coach.headline}</p>}
          <CoachBadges verified={coach.verified} inclusive={coach.inclusive} />
          <div className="mt-auto flex items-center justify-between border-t pt-3">
            <RatingStars rating={Number(coach.rating_avg)} count={coach.rating_count} />
            <span className="text-sm">{t("from")} <Points value={coach.price_per_session} className="text-primary" /> {t("perSession")}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
