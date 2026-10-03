import { useTranslations } from "next-intl";
import type { AchievementLevel } from "@/lib/config";
import { cn } from "@/lib/utils";

export function LevelChip({ level, className }: { level: AchievementLevel; className?: string }) {
  const t = useTranslations("levels");
  return (
    <span
      className={cn("inline-flex h-5 items-center rounded-full px-2 text-xs font-semibold text-[var(--level-foreground)]", className)}
      style={{ background: `var(--level-${level})` }}
    >
      {t(level)}
    </span>
  );
}
