import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Price } from "@/components/shared/price";
import { Section } from "@/components/shared/section";
import { Stat } from "@/components/shared/stat";
import { listCoachBookings } from "@/features/bookings/queries";
import { PaymentList } from "@/features/payments/components/payment-list";
import { getEarnings, listPayments } from "@/features/payments/queries";
import { requireRole } from "@/lib/auth";
import { formatDateTime } from "@/lib/dates";
import { splitPayout } from "@/lib/money";

export default async function PaymentsPage() {
  const user = await requireRole(["client", "coach"]);
  const t = await getTranslations("payments");
  if (user.role === "client") {
    return (
      <>
        <PageHeader title={t("clientTitle")} />
        <PaymentList payments={await listPayments(user.id)} />
      </>
    );
  }

  const [earnings, bookings] = await Promise.all([getEarnings(), listCoachBookings(user.id)]);
  const completed = bookings.filter((b) => b.status === "completed");
  return (
    <>
      <PageHeader title={t("coachTitle")} description={t("coachSubtitle")} />
      <div className="grid gap-6 sm:grid-cols-3">
        <Stat label={t("month")} value={<Price value={earnings.month} />} />
        <Stat label={t("total")} value={<Price value={earnings.total} />} hint={t("payoutNote")} />
        <Stat label={t("sessions")} value={earnings.sessions} />
      </div>
      <Section title={t("history")}>
        {completed.length === 0 ? <EmptyState title={t("emptyEarnings")} /> : (
          <table className="w-full text-sm">
            <thead className="text-start text-muted-foreground">
              <tr className="border-b">
                <th className="py-2 text-start font-medium">{t("session")}</th>
                <th className="hidden py-2 text-end font-medium sm:table-cell">{t("gross")}</th>
                <th className="hidden py-2 text-end font-medium sm:table-cell">{t("commission")}</th>
                <th className="py-2 text-end font-medium">{t("net")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {completed.map((b) => {
                const split = splitPayout(b.price);
                return (
                  <tr key={b.id}>
                    <td className="py-3">
                      <p className="font-semibold">{b.client.full_name}</p>
                      <p className="text-xs capitalize text-muted-foreground">{formatDateTime(b.slot.starts_at)}</p>
                    </td>
                    <td className="hidden py-3 text-end sm:table-cell"><Price value={b.price} className="font-medium" /></td>
                    <td className="hidden py-3 text-end text-muted-foreground sm:table-cell">−<Price value={split.platform} className="font-medium" /></td>
                    <td className="py-3 text-end"><Price value={split.coach} className="text-base" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Section>
    </>
  );
}
