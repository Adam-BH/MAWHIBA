import Link from "next/link";
import { Clock, HeartHandshake, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/shared/price";
import { cn } from "@/lib/utils";
import type { Enums } from "@/lib/supabase/database.types";

type OfferCardData = {
  title: string;
  sport: string;
  description: string;
  duration_min: number;
  price: number;
  audience: Enums<"offer_audience">;
  is_inclusive: boolean;
  is_active?: boolean;
};

export function OfferCard({ offer, href, selected, footer, coachLine }: {
  offer: OfferCardData;
  href?: string;
  selected?: boolean;
  footer?: React.ReactNode;
  coachLine?: React.ReactNode;
}) {
  const t = useTranslations("offers");
  const body = (
    <div className={cn("flex h-full flex-col gap-2 rounded-3xl border bg-card p-5",
      selected && "border-primary ring-2 ring-primary/20", href && "lift hover:border-primary/50",
      offer.is_active === false && "opacity-60")}>
      {coachLine}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">{offer.title}</p>
          <p className="text-sm text-muted-foreground">{offer.sport}</p>
        </div>
        <Price value={offer.price} className="shrink-0 text-lg text-primary" />
      </div>
      {offer.description && <p className="line-clamp-2 text-sm text-muted-foreground">{offer.description}</p>}
      <div className="mt-auto flex flex-wrap gap-1.5">
        <Badge variant="outline"><Clock />{t("duration", { min: offer.duration_min })}</Badge>
        <Badge variant="outline"><Users />{t(`audience.${offer.audience}`)}</Badge>
        {offer.is_inclusive && <Badge className="border-transparent bg-accent/15 text-accent-foreground"><HeartHandshake />{t("inclusive")}</Badge>}
        {offer.is_active === false && <Badge variant="secondary">{t("inactive")}</Badge>}
      </div>
      {footer}
    </div>
  );
  return href ? <Link href={href} scroll={false} aria-current={selected || undefined} className="block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50">{body}</Link> : body;
}
