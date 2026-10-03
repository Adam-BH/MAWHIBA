import { Receipt } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Price } from "@/components/shared/price";
import { StatusBadge } from "@/components/shared/status-badge";
import { paymentStatus, type PaymentRow } from "@/features/payments/queries";
import { formatDateTime } from "@/lib/dates";

export function PaymentList({ payments, showClient = false }: { payments: PaymentRow[]; showClient?: boolean }) {
  const t = useTranslations();
  if (payments.length === 0) return <EmptyState icon={Receipt} title={t("payments.empty")} />;
  return (
    <Card>
      <CardContent>
        <ul className="divide-y">
          {payments.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
              <div className="min-w-48 flex-1">
                <p className="truncate font-medium">
                  {showClient && `${p.client.full_name} → `}{t("pay.description", { coach: p.slot.coach.profile.full_name })}
                </p>
                <p className="text-xs capitalize text-muted-foreground">{formatDateTime(p.slot.starts_at)}</p>
              </div>
              <Price value={p.amount} />
              <StatusBadge status={paymentStatus(p)} />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
