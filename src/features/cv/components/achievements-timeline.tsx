import { BadgeCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { LevelChip } from "@/components/shared/level-chip";
import type { CoachFull } from "@/features/cv/queries";

/** Palmarès grouped by year, newest first, with "Vérifié" marks. */
export function AchievementsTimeline({ achievements }: { achievements: CoachFull["achievements"] }) {
  const t = useTranslations("cv");
  const byYear = Map.groupBy([...achievements].sort((a, b) => b.year - a.year), (a) => a.year);
  return (
    <ol className="relative ms-2 border-s-2 border-border">
      {[...byYear.entries()].map(([year, items]) => (
        <li key={year} className="mb-5 ms-5">
          <span className="absolute -start-[9px] mt-1 size-4 rounded-full border-2 border-card bg-primary" aria-hidden />
          <p className="font-display text-lg font-semibold text-primary">{year}</p>
          <ul className="mt-1 flex flex-col gap-2">
            {items.map((a) => (
              <li key={a.id} className="rounded-lg border bg-card p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{a.title}</span>
                  {a.result && <span className="text-muted-foreground">· {a.result}</span>}
                  <LevelChip level={a.level} />
                  {a.verified && <span className="flex items-center gap-0.5 text-xs font-semibold text-success"><BadgeCheck className="size-3.5" />{t("verified")}</span>}
                </div>
                {a.competition && <p className="text-sm text-muted-foreground">{a.competition}</p>}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
