import Link from "next/link";
import { BadgeCheck, Inbox, Send, ShieldAlert } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { getMyCoachProfile } from "@/features/coaches/queries";
import { BoardFilters } from "@/features/requests/components/board-filters";
import { RequestCard } from "@/features/requests/components/request-card";
import { listBoard } from "@/features/requests/queries";
import type { CurrentUser } from "@/lib/auth";

export async function VerificationRequired() {
  const t = await getTranslations("requests.board");
  return (
    <EmptyState icon={ShieldAlert} title={t("verificationTitle")} description={t("verificationText")}
      action={<Button asChild><Link href="/profile">{t("verificationCta")}</Link></Button>} />
  );
}

export async function CoachBoard({ user, city }: { user: CurrentUser; city?: string }) {
  const [t, coach] = await Promise.all([getTranslations("requests"), getMyCoachProfile(user.id)]);
  const header = <PageHeader title={t("coachTitle")} description={t("coachSubtitle")} />;
  if (!coach?.verified) return <>{header}<VerificationRequired /></>;

  // Default to the coach's city; "all" removes the filter.
  const selectedCity = city ?? user.city ?? "all";
  const board = await listBoard(user.id, coach.sports, selectedCity === "all" ? undefined : selectedCity);

  return (
    <>
      {header}
      <Suspense><BoardFilters city={selectedCity} /></Suspense>
      {coach.sports.length === 0 ? (
        <EmptyState icon={Inbox} title={t("board.noSports")} action={<Button asChild><Link href="/profile">{t("board.completeProfile")}</Link></Button>} />
      ) : board.length === 0 ? (
        <EmptyState icon={Inbox} title={t("board.empty")} description={t("board.emptyHint", { sports: coach.sports.join(", ") })} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {board.map((r) => (
            <RequestCard key={r.id} request={r} href={`/requests/${r.id}`}
              highlight={r.myProposal === "accepted" ? <Badge className="border-transparent bg-success/15 text-success"><BadgeCheck />{t("board.accepted")}</Badge>
                : r.myProposal ? <Badge variant="secondary"><Send />{t("board.sent")}</Badge> : undefined} />
          ))}
        </div>
      )}
    </>
  );
}
