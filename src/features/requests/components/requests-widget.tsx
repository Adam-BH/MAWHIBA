import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { BudgetRange } from "@/components/shared/budget-range";
import { Section } from "@/components/shared/section";
import { listBoard, listMyRequests } from "@/features/requests/queries";
import { effectiveRequestStatus } from "@/lib/request-rules";

const linkClass = "text-sm font-semibold text-primary hover:underline";

export async function ClientRequestsWidget({ userId }: { userId: string }) {
  const [t, requests] = await Promise.all([getTranslations("requests.widget"), listMyRequests(userId)]);
  const open = requests.filter((r) => effectiveRequestStatus(r.status, new Date(r.expires_at)) === "open");
  const newProposals = open.reduce((sum, r) => sum + r.pending_count, 0);
  return (
    <Section title={t("clientTitle")}
      action={<Link href={open.length ? "/requests" : "/requests/new"} className={linkClass}>{open.length ? t("see") : t("post")}</Link>}>
      <p>{t("openCount", { count: open.length })}</p>
      {newProposals > 0 && <p className="mt-1 font-semibold text-primary">{t("newProposals", { count: newProposals })}</p>}
      {open.length === 0 && <p className="mt-1 text-muted-foreground">{t("clientHint")}</p>}
    </Section>
  );
}

export async function CoachRequestsWidget({ userId, sports, city }: { userId: string; sports: string[]; city: string | null }) {
  const [t, board] = await Promise.all([getTranslations("requests.widget"), listBoard(userId, sports, city ?? undefined)]);
  const fresh = board.filter((r) => !r.myProposal);
  return (
    <Section title={t("coachTitle")} action={<Link href="/requests" className={linkClass}>{t("see")}</Link>}>
      <p className="text-muted-foreground">{t("matchingCount", { count: fresh.length })}</p>
      {fresh.length > 0 && (
        <ul className="mt-2 divide-y border-y">
          {fresh.slice(0, 3).map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-4 py-3">
              <Link href={`/requests/${r.id}`} className="truncate hover:underline">{r.title}</Link>
              <BudgetRange min={r.budget_min ?? 0} max={r.budget_max ?? 0} className="shrink-0 font-semibold" />
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
