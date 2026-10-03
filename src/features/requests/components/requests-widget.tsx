import Link from "next/link";
import { Megaphone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetRange } from "@/components/shared/budget-range";
import { listBoard, listMyRequests } from "@/features/requests/queries";
import { effectiveRequestStatus } from "@/lib/request-rules";

function WidgetShell({ title, cta, children }: { title: string; cta: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2"><Megaphone className="size-5 text-primary" />{title}</CardTitle>
        {cta}
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm">{children}</CardContent>
    </Card>
  );
}

export async function ClientRequestsWidget({ userId }: { userId: string }) {
  const [t, requests] = await Promise.all([getTranslations("requests.widget"), listMyRequests(userId)]);
  const open = requests.filter((r) => effectiveRequestStatus(r.status, new Date(r.expires_at)) === "open");
  const newProposals = open.reduce((sum, r) => sum + r.pending_count, 0);
  return (
    <WidgetShell title={t("clientTitle")} cta={<Button asChild size="sm" variant="outline"><Link href={open.length ? "/requests" : "/requests/new"}>{open.length ? t("see") : t("post")}</Link></Button>}>
      <p>{t("openCount", { count: open.length })}</p>
      {newProposals > 0 && <p className="font-semibold text-accent-foreground">{t("newProposals", { count: newProposals })}</p>}
      {open.length === 0 && <p className="text-muted-foreground">{t("clientHint")}</p>}
    </WidgetShell>
  );
}

export async function CoachRequestsWidget({ userId, sports, city }: { userId: string; sports: string[]; city: string | null }) {
  const [t, board] = await Promise.all([getTranslations("requests.widget"), listBoard(userId, sports, city ?? undefined)]);
  const fresh = board.filter((r) => !r.myProposal);
  return (
    <WidgetShell title={t("coachTitle")} cta={<Button asChild size="sm" variant="outline"><Link href="/requests">{t("see")}</Link></Button>}>
      <p>{t("matchingCount", { count: fresh.length })}</p>
      <ul className="divide-y">
        {fresh.slice(0, 3).map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-2 py-2">
            <Link href={`/requests/${r.id}`} className="truncate hover:underline">{r.title}</Link>
            <BudgetRange min={r.budget_min ?? 0} max={r.budget_max ?? 0} className="shrink-0 text-primary" />
          </li>
        ))}
      </ul>
    </WidgetShell>
  );
}
