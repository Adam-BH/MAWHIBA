import { Hourglass } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function TimeLeft({ expiresAt, now = new Date(), className }: { expiresAt: string | Date; now?: Date; className?: string }) {
  const t = useTranslations("requests");
  const hours = Math.floor((new Date(expiresAt).getTime() - now.getTime()) / 3_600_000);
  const label = hours <= 0 ? t("expired") : hours < 24 ? t("expiresInHours", { hours }) : t("expiresInDays", { days: Math.floor(hours / 24) });
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm text-muted-foreground", hours <= 24 && "text-warning-foreground", className)}>
      <Hourglass className="size-3.5" />{label}
    </span>
  );
}
