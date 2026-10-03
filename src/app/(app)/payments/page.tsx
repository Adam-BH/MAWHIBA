import { CalendarCheck, Coins, TrendingUp } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Price } from "@/components/shared/price";
import { StatCard } from "@/components/shared/stat-card";
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
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard icon={TrendingUp} tone="accent" label={t("month")} value={<Price value={earnings.month} />} />
        <StatCard icon={Coins} tone="success" label={t("total")} value={<Price value={earnings.total} />} hint={t("payoutNote")} />
        <StatCard icon={CalendarCheck} label={t("sessions")} value={earnings.sessions} />
      </div>
      <h2 className="mb-3 text-xl font-semibold">{t("history")}</h2>
      {completed.length === 0 ? <EmptyState icon={CalendarCheck} title={t("emptyEarnings")} /> : (
        <Card>
          <CardContent>
            <ul className="divide-y">
              {completed.map((b) => {
                const split = splitPayout(b.price);
                return (
                  <li key={b.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-sm">
                    <div className="min-w-48 flex-1">
                      <p className="truncate font-medium">{b.client.full_name}</p>
                      <p className="text-xs capitalize text-muted-foreground">{formatDateTime(b.slot.starts_at)}</p>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-muted-foreground">{t("gross")} <Price value={b.price} className="font-normal" /></span>
                      <span className="text-muted-foreground">{t("commission")} −<Price value={split.platform} className="font-normal" /></span>
                      <span>{t("net")} <Price value={split.coach} className="text-success" /></span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </>
  );
}
