import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMyCoachProfile } from "@/features/coaches/queries";
import { listMyOffers } from "@/features/offers/queries";
import { ProposalCard } from "@/features/proposals/components/proposal-card";
import { ProposalForm } from "@/features/proposals/components/proposal-form";
import { WithdrawProposalButton } from "@/features/proposals/components/withdraw-proposal-button";
import { VerificationRequired } from "@/features/requests/components/coach-board";
import { RequestCard } from "@/features/requests/components/request-card";
import { getBoardRequest, getMyProposal } from "@/features/requests/queries";
import { listMyUpcomingSlots } from "@/features/slots/queries";
import type { CurrentUser } from "@/lib/auth";
import { suggestedProposalPrice } from "@/lib/request-rules";

export async function CoachRequestDetail({ requestId, user }: { requestId: string; user: CurrentUser }) {
  const [t, coach] = await Promise.all([getTranslations("requests"), getMyCoachProfile(user.id)]);
  if (!coach?.verified) return <VerificationRequired />;
  const [request, proposal, slots, offers] = await Promise.all([
    getBoardRequest(requestId), getMyProposal(requestId, user.id), listMyUpcomingSlots(user.id), listMyOffers(user.id),
  ]);
  if (!request) notFound();
  const budget = { min: request.budget_min ?? 0, max: request.budget_max ?? 0 };
  const wantedAudience = request.audience === "enfant" ? "enfants" : "adultes";
  const matching = offers
    .filter((o) => o.is_active && o.sport === request.sport && (o.audience === wantedAudience || o.audience === "tous"))
    .sort((a, b) => a.price - b.price)[0];
  const active = proposal && (proposal.status === "pending" || proposal.status === "accepted");

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Button asChild variant="ghost" className="self-start"><Link href="/requests"><ArrowLeft />{t("back")}</Link></Button>
      <RequestCard detailed request={request} />
      <Card>
        <CardHeader><CardTitle>{active ? t("myProposal") : t("makeProposal")}</CardTitle></CardHeader>
        <CardContent>
          {proposal && (active || request.status !== "open") ? (
            <ProposalCard proposal={proposal} budget={budget}
              actions={proposal.status === "pending" && <WithdrawProposalButton proposalId={proposal.id} />} />
          ) : request.status === "open" ? (
            <ProposalForm requestId={requestId} budget={budget}
              defaultPrice={suggestedProposalPrice(matching?.price ?? null, budget.max)}
              slots={slots.filter((s) => !s.is_booked)} />
          ) : (
            <p className="text-sm text-muted-foreground">{t("noLongerOpen")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
