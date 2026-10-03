import Link from "next/link";
import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { RequestCard } from "@/features/requests/components/request-card";
import { listMyRequests } from "@/features/requests/queries";
import { MAX_OPEN_REQUESTS } from "@/lib/config";
import { effectiveRequestStatus } from "@/lib/request-rules";

export async function ClientRequests({ userId }: { userId: string }) {
  const [t, requests] = await Promise.all([getTranslations("requests"), listMyRequests(userId)]);
  const withStatus = requests.map((r) => ({ ...r, status: effectiveRequestStatus(r.status, new Date(r.expires_at)) }));
  const openCount = withStatus.filter((r) => r.status === "open").length;
  const canPost = openCount < MAX_OPEN_REQUESTS;
  const cta = canPost
    ? <Button asChild><Link href="/requests/new"><Plus />{t("new")}</Link></Button>
    : <p className="text-sm text-muted-foreground">{t("maxOpen", { max: MAX_OPEN_REQUESTS })}</p>;

  return (
    <>
      <PageHeader title={t("clientTitle")} actions={cta} />
      {withStatus.length === 0 ? (
        <EmptyState title={t("emptyClient")} action={canPost ? cta : undefined} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {withStatus.map((r) => (
            <RequestCard key={r.id} request={r} href={`/requests/${r.id}`}
              highlight={r.pending_count > 0 ? <Badge className="border-transparent bg-accent text-accent-foreground">{t("newProposals", { count: r.pending_count })}</Badge> : undefined} />
          ))}
        </div>
      )}
    </>
  );
}
