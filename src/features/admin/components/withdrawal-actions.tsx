"use client";

import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { processWithdrawalAction } from "@/features/admin/actions";
import { useAction } from "@/lib/use-action";

export function WithdrawalActions({ withdrawalId }: { withdrawalId: string }) {
  const t = useTranslations("admin.wallets");
  const { pending, run } = useAction();
  return (
    <div className="flex gap-2">
      <Button size="sm" disabled={pending} onClick={() => run(() => processWithdrawalAction(withdrawalId, true), { success: t("approved") })}>
        <Check />{t("approve")}
      </Button>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => processWithdrawalAction(withdrawalId, false), { success: t("rejected") })}>
        <X />{t("reject")}
      </Button>
    </div>
  );
}
