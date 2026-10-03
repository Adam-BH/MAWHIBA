import Link from "next/link";
import { useTranslations } from "next-intl";
import { AthleteCard } from "@/components/shared/athlete-card";
import { Points } from "@/components/shared/points";
import type { CoachCardData } from "@/features/coaches/queries";
import { athleteCardData } from "@/lib/athlete-card";

export function CoachCard({ coach }: { coach: CoachCardData }) {
  const t = useTranslations("coaches");
  return (
    <Link href={`/coaches/${coach.slug ?? coach.user_id}`} className="group lift flex flex-col overflow-hidden rounded-3xl border bg-card outline-none hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50">
      <AthleteCard variant="compact" card={athleteCardData(coach, 0, 100)} className="rounded-b-none" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        {(coach.tagline ?? coach.headline) && <p className="line-clamp-2 text-sm">{coach.tagline ?? coach.headline}</p>}
        <p className="mt-auto text-sm">{t("from")} <Points value={coach.price_per_session} className="text-primary" /> {t("perSession")}</p>
      </div>
    </Link>
  );
}
