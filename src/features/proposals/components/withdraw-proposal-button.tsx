"use client";

import { Undo2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { withdrawProposalAction } from "@/features/proposals/actions";
import { useAction } from "@/lib/use-action";

export function WithdrawProposalButton({ proposalId }: { proposalId: string }) {
  const t = useTranslations("proposals");
  const { pending, run } = useAction();
  return (
    <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => withdrawProposalAction(proposalId), { success: t("withdrawn") })}>
      <Undo2 />{t("withdraw")}
    </Button>
  );
}
