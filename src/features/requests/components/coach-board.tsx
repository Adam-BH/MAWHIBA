import Link from "next/link";
import { BadgeCheck, Send, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { getMyCoachProfile } from "@/features/coaches/queries";
import { getRequestMatches } from "@/features/matching/queries";
import { BoardFilters } from "@/features/requests/components/board-filters";
import { RequestCard } from "@/features/requests/components/request-card";
import { listBoard } from "@/features/requests/queries";
import type { CurrentUser } from "@/lib/auth";

const BOARD_MATCH_FROM = 60;

export async function VerificationRequired() {
  const t = await getTranslations("requests.board");
  return (
    <EmptyState title={t("verificationTitle")}
      action={<Button asChild><Link href="/profile">{t("verificationCta")}</Link></Button>} />
  );
}

export async function CoachBoard({ user, city, sort }: { user: CurrentUser; city?: string; sort: "match" | "recent" }) {
  const [t, tm, coach] = await Promise.all([getTranslations("requests"), getTranslations("matching"), getMyCoachProfile(user.id)]);
  const header = <PageHeader title={t("coachTitle")} />;
  if (!coach?.verified) return <>{header}<VerificationRequired /></>;

  // Default to the coach's city; "all" removes the filter.
  const selectedCity = city ?? user.city ?? "all";
  const [rows, matches] = await Promise.all([listBoard(user.id, coach.sports, selectedCity === "all" ? undefined : selectedCity), getRequestMatches()]);
  const scoreOf = (id: string | null) => (id && matches.get(id)?.score) || 0;
  const board = sort === "match" ? [...rows].sort((a, b) => scoreOf(b.id) - scoreOf(a.id)) : rows;

  return (
    <>
      {header}
      <Suspense><BoardFilters city={selectedCity} sort={sort} /></Suspense>
      {coach.sports.length === 0 ? (
        <EmptyState title={t("board.noSports")} action={<Button asChild><Link href="/profile">{t("board.completeProfile")}</Link></Button>} />
      ) : board.length === 0 ? (
        <EmptyState title={t("board.empty")} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {board.map((r) => (
            <RequestCard key={r.id} request={r} href={`/requests/${r.id}`}
              highlight={r.myProposal === "accepted" ? <Badge className="border-transparent bg-success/15 text-success"><BadgeCheck />{t("board.accepted")}</Badge>
                : r.myProposal ? <Badge variant="secondary"><Send />{t("board.sent")}</Badge>
                : scoreOf(r.id) >= BOARD_MATCH_FROM ? <Badge variant="accent"><Sparkles />{tm("boardMatch")}</Badge> : undefined} />
          ))}
        </div>
      )}
    </>
  );
}
