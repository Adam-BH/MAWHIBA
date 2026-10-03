import Link from "next/link";
import { ArrowLeft, Hourglass } from "lucide-react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { AcceptProposalDialog } from "@/features/proposals/components/accept-proposal-dialog";
import { ProposalCard } from "@/features/proposals/components/proposal-card";
import { CloseRequestButton } from "@/features/requests/components/close-request-button";
import { RequestCard } from "@/features/requests/components/request-card";
import { getMyRequest } from "@/features/requests/queries";
import { getBalance } from "@/features/wallet/queries";
import { canAcceptProposal, effectiveRequestStatus } from "@/lib/request-rules";

export async function ClientRequestDetail({ requestId, userId }: { requestId: string; userId: string }) {
  const [t, request, balance] = await Promise.all([getTranslations("requests"), getMyRequest(requestId, userId), getBalance(userId)]);
  if (!request) notFound();
  const expiresAt = new Date(request.expires_at);
  const status = effectiveRequestStatus(request.status, expiresAt);
  const budget = { min: request.budget_min, max: request.budget_max };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Button asChild variant="ghost" className="self-start"><Link href="/requests"><ArrowLeft />{t("back")}</Link></Button>
      <RequestCard detailed request={{ ...request, status }} footer={status === "open" ? <CloseRequestButton requestId={request.id} size="sm" /> : undefined} />
      <section>
        <h2 className="mb-3 text-xl font-semibold">{t("proposalsTitle", { count: request.proposals.length })}</h2>
        {request.proposals.length === 0 ? (
          <EmptyState icon={Hourglass} title={t("noProposals")} description={t("noProposalsHint")} />
        ) : (
          <div className="grid gap-3">
            {request.proposals.map((p) => (
              <ProposalCard key={p.id} proposal={p} budget={budget}
                actions={canAcceptProposal(p.status, request.status, expiresAt) && (
                  p.slot.is_booked || new Date(p.slot.starts_at) <= new Date()
                    ? <span className="text-sm text-muted-foreground">{t("slotTaken")}</span>
                    : <AcceptProposalDialog proposalId={p.id} price={p.price} coachName={p.coach.profile.full_name} balance={balance} />
                )} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
