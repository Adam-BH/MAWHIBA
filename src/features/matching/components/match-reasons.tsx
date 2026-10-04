import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Match } from "@/features/matching/queries";
import { formatDistance } from "@/lib/geo";

export const MATCH_STRONG_FROM = 75;
export const MATCH_GOOD_FROM = 50;

/** "Très bon match" + up to 3 reason chips. Never shows the raw score. */
export function MatchReasons({ match, sport, distanceKm }: { match: Match; sport: string | null; distanceKm: number | null }) {
  const t = useTranslations("matching");
  const level = match.score >= MATCH_STRONG_FROM ? "strong" : match.score >= MATCH_GOOD_FROM ? "good" : null;
  if (!level && !match.reasons.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      {level && <span className="flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 font-semibold text-accent-foreground"><Sparkles className="size-3" />{t(level)}</span>}
      {match.reasons.map((r) => (
        <span key={r} className="rounded-full bg-secondary px-2 py-0.5 font-semibold text-primary">
          {t(`reasons.${r}`, { sport: sport ?? "", distance: distanceKm !== null ? formatDistance(distanceKm) : "" })}
        </span>
      ))}
    </div>
  );
}
