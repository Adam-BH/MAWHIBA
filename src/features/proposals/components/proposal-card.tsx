import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { CoachBadges } from "@/components/shared/coach-badges";
import { Price } from "@/components/shared/price";
import { RatingStars } from "@/components/shared/rating-stars";
import { StatusBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { Enums } from "@/lib/supabase/database.types";
import { formatDateTime, formatTime } from "@/lib/dates";
import { isOutOfBudget } from "@/lib/request-rules";

export type ProposalCardData = {
  price: number;
  message: string;
  status: Enums<"proposal_status">;
  slot: { starts_at: string; ends_at: string; location: string };
  coach?: {
    user_id: string;
    slug?: string | null;
    verified: boolean;
    rating_avg: number;
    rating_count: number;
    profile: { full_name: string; avatar_url: string | null };
  };
  inclusive?: boolean;
};

export function ProposalCard({ proposal, budget, actions }: {
  proposal: ProposalCardData;
  budget: { min: number; max: number };
  actions?: React.ReactNode;
}) {
  const t = useTranslations("proposals");
  const outOfBudget = isOutOfBudget(proposal.price, budget.min, budget.max);
  const { coach } = proposal;

  return (
    <article className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      {coach && (
        <div className="flex items-start gap-3">
          <UserAvatar name={coach.profile.full_name} src={coach.profile.avatar_url} className="size-12" />
          <div className="min-w-0 flex-1">
            <Link href={`/coaches/${coach.slug ?? coach.user_id}`} className="font-semibold hover:underline">{coach.profile.full_name}</Link>
            <div><RatingStars rating={Number(coach.rating_avg)} count={coach.rating_count} /></div>
            <CoachBadges verified={coach.verified} inclusive={proposal.inclusive} />
          </div>
          {proposal.status !== "pending" && <StatusBadge status={proposal.status} />}
        </div>
      )}
      <div className="grid gap-1 text-sm">
        <p className="flex items-center gap-1.5 capitalize"><Clock className="size-3.5 text-muted-foreground" />{formatDateTime(proposal.slot.starts_at)} – {formatTime(proposal.slot.ends_at)}</p>
        <p className="flex items-center gap-1.5"><MapPin className="size-3.5 text-muted-foreground" />{proposal.slot.location}</p>
      </div>
      {proposal.message && <p className="rounded-lg bg-muted p-3 text-sm">{proposal.message}</p>}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
        <div className="flex items-center gap-2">
          <Price value={proposal.price} className="text-lg text-primary" />
          {outOfBudget && <Badge className="border-transparent bg-warning/20 text-warning-foreground">{t("outOfBudget")}</Badge>}
          {!coach && proposal.status !== "pending" && <StatusBadge status={proposal.status} />}
        </div>
        {actions}
      </div>
    </article>
  );
}
