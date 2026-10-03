import Link from "next/link";
import { CalendarClock, HeartHandshake, MapPin, MessageSquare, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { BudgetRange } from "@/components/shared/budget-range";
import { StatusBadge } from "@/components/shared/status-badge";
import { TimeLeft } from "@/components/shared/time-left";
import type { Enums } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

// Nullable fields so rows from both `requests` and the `request_board` view fit.
export type RequestCardData = {
  sport: string | null;
  city: string | null;
  title: string | null;
  description?: string | null;
  audience: Enums<"request_audience"> | null;
  child_age: number | null;
  level: Enums<"skill_level"> | null;
  special_needs: boolean | null;
  special_needs_note?: string | null;
  schedule_note: string | null;
  budget_min: number | null;
  budget_max: number | null;
  status: Enums<"request_status"> | null;
  expires_at: string | null;
  client_first_name?: string | null;
  proposals_count?: number | null;
};

export function RequestCard({ request, href, footer, detailed = false, highlight }: {
  request: RequestCardData;
  href?: string;
  footer?: React.ReactNode;
  detailed?: boolean;
  highlight?: React.ReactNode;
}) {
  const t = useTranslations("requests");
  const audience = request.audience === "enfant" ? t("child", { age: request.child_age ?? 0 }) : t("adult");
  const title = href ? <Link href={href} className="after:absolute after:inset-0 hover:underline">{request.title}</Link> : request.title;

  return (
    <article className={cn("relative flex flex-col gap-3 rounded-3xl border bg-card p-5", href && "lift hover:border-primary/40")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-primary">{request.sport}</p>
          <h3 className="font-semibold">{title}</h3>
        </div>
        {request.status && request.status !== "open" ? <StatusBadge status={request.status} /> : highlight}
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="outline"><UserRound />{audience}</Badge>
        {request.level && <Badge variant="outline">{t(`level.${request.level}`)}</Badge>}
        {request.special_needs && <Badge className="border-transparent bg-accent/15 text-accent-foreground"><HeartHandshake />{t("specialNeeds")}</Badge>}
      </div>
      {detailed && request.description && <p className="whitespace-pre-line text-sm">{request.description}</p>}
      {detailed && request.special_needs_note && <p className="rounded-lg bg-muted p-3 text-sm">{request.special_needs_note}</p>}
      <div className="grid gap-1 text-sm text-muted-foreground">
        <p className="flex items-center gap-1.5"><MapPin className="size-3.5" />{request.client_first_name ? `${request.client_first_name} · ` : ""}{request.city}</p>
        {request.schedule_note && <p className="flex items-center gap-1.5"><CalendarClock className="size-3.5" />{request.schedule_note}</p>}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
        <BudgetRange min={request.budget_min ?? 0} max={request.budget_max ?? 0} className="text-primary" />
        <div className="flex items-center gap-3">
          {request.proposals_count !== undefined && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground"><MessageSquare className="size-3.5" />{t("proposalsCount", { count: request.proposals_count ?? 0 })}</span>
          )}
          {request.status === "open" && request.expires_at && <TimeLeft expiresAt={request.expires_at} />}
        </div>
      </div>
      {footer && <div className="relative">{footer}</div>}
    </article>
  );
}
