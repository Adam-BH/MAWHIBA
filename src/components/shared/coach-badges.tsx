import { BadgeCheck, HeartHandshake } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

export function CoachBadges({ verified, inclusive }: { verified?: boolean; inclusive?: boolean }) {
  const t = useTranslations("badges");
  return (
    <div className="flex flex-wrap gap-1.5">
      {verified && <Badge className="border-transparent bg-secondary text-primary"><BadgeCheck />{t("verified")}</Badge>}
      {inclusive && <Badge className="border-transparent bg-accent/15 text-accent-foreground"><HeartHandshake />{t("inclusive")}</Badge>}
    </div>
  );
}
