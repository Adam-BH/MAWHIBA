import { ArrowDownLeft, ArrowUpRight, Receipt } from "lucide-react";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/shared/empty-state";
import { Points } from "@/components/shared/points";
import { formatDateTime } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { Enums, Json } from "@/lib/supabase/database.types";

type Tx = { id: string; amount: number; type: Enums<"tx_type">; meta: Json; created_at: string };

function reasonOf(meta: Json) {
  return meta && typeof meta === "object" && !Array.isArray(meta) && typeof meta.reason === "string" ? meta.reason : null;
}

export function TxList({ transactions }: { transactions: Tx[] }) {
  const t = useTranslations("wallet");
  if (transactions.length === 0) return <EmptyState icon={Receipt} title={t("noTx")} />;
  return (
    <ul className="divide-y rounded-xl border bg-card">
      {transactions.map((tx) => {
        const credit = tx.amount > 0;
        const Icon = credit ? ArrowDownLeft : ArrowUpRight;
        return (
          <li key={tx.id} className="flex items-center gap-3 p-3">
            <div className={cn("rounded-full p-2", credit ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{t(`tx.${tx.type}`)}</p>
              <p className="truncate text-xs capitalize text-muted-foreground">{formatDateTime(tx.created_at)}{reasonOf(tx.meta) ? ` · ${reasonOf(tx.meta)}` : ""}</p>
            </div>
            <Points value={tx.amount} signed className={credit ? "text-success" : "text-foreground"} />
          </li>
        );
      })}
    </ul>
  );
}
