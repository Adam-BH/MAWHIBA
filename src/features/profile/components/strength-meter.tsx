import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Progress } from "@/components/ui/progress";
import type { StrengthHint, StrengthLevel } from "@/lib/profile-strength";
import { cn } from "@/lib/utils";

export function StrengthMeter({ score, level, next, className }: {
  score: number;
  level: StrengthLevel;
  next: StrengthHint | null;
  className?: string;
}) {
  const t = useTranslations("strength");
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-medium">{t("title")}</span>
        <span className="flex items-center gap-1 font-semibold">
          {level === "elite" && <Sparkles className="size-4 text-accent" />}
          {t(`levels.${level}`)} · {score}%
        </span>
      </div>
      <Progress value={score} aria-label={t("title")} />
      {next && <p className="text-xs text-muted-foreground">{t("next", { hint: t(`hints.${next.key}`, { count: next.count ?? 1 }), gain: next.gain })}</p>}
    </div>
  );
}
