import { useTranslations } from "next-intl";
import { Points } from "@/components/shared/points";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/dates";
import type { Enums } from "@/lib/supabase/database.types";

type Withdrawal = { id: string; amount: number; status: Enums<"withdrawal_status">; created_at: string };

export function WithdrawalList({ withdrawals }: { withdrawals: Withdrawal[] }) {
  const t = useTranslations("wallet.withdraw");
  if (withdrawals.length === 0) return <p className="text-sm text-muted-foreground">{t("none")}</p>;
  return (
    <ul className="divide-y rounded-xl border bg-card">
      {withdrawals.map((w) => (
        <li key={w.id} className="flex items-center gap-3 p-3">
          <div className="flex-1">
            <Points value={w.amount} />
            <p className="text-xs capitalize text-muted-foreground">{formatDateTime(w.created_at)}</p>
          </div>
          <StatusBadge status={w.status} />
        </li>
      ))}
    </ul>
  );
}
