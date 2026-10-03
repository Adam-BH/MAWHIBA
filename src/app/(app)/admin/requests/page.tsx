import { Megaphone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Points } from "@/components/shared/points";
import { StatusBadge } from "@/components/shared/status-badge";
import { CloseRequestButton } from "@/features/requests/components/close-request-button";
import { RequestCard } from "@/features/requests/components/request-card";
import { listAllRequests } from "@/features/requests/queries";
import { requireRole } from "@/lib/auth";
import { effectiveRequestStatus } from "@/lib/request-rules";

export default async function AdminRequestsPage() {
  await requireRole(["admin"]);
  const [t, requests] = await Promise.all([getTranslations("admin.requests"), listAllRequests()]);

  return (
    <>
      <PageHeader title={t("title")} description={t("subtitle")} />
      {requests.length === 0 ? <EmptyState icon={Megaphone} title={t("empty")} /> : (
        <div className="grid gap-3 lg:grid-cols-2">
          {requests.map((r) => {
            const status = effectiveRequestStatus(r.status, new Date(r.expires_at));
            return (
              <RequestCard key={r.id} detailed request={{ ...r, status, client_first_name: `${r.client.full_name} (${r.client.email})` }}
                footer={
                  <div className="flex flex-col gap-2">
                    {r.proposals.length > 0 && (
                      <ul className="divide-y rounded-lg border text-sm">
                        {r.proposals.map((p) => (
                          <li key={p.id} className="flex items-center justify-between gap-2 px-3 py-2">
                            <span className="truncate">{p.coach.profile.full_name}</span>
                            <span className="flex items-center gap-2"><Points value={p.price} /><StatusBadge status={p.status} /></span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {status === "open" && <CloseRequestButton requestId={r.id} size="sm" />}
                  </div>
                } />
            );
          })}
        </div>
      )}
    </>
  );
}
