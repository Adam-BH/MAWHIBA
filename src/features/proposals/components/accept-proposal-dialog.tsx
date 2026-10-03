"use client";

import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { startProposalCheckoutAction } from "@/features/payments/actions";
import { INSURANCE_FEE } from "@/lib/config";
import { checkoutTotal } from "@/lib/money";
import { useAction } from "@/lib/use-action";

export function AcceptProposalDialog({ proposalId, price, coachName }: { proposalId: string; price: number; coachName: string }) {
  const t = useTranslations("proposals.accept");
  const router = useRouter();
  const { pending, run } = useAction();
  const total = checkoutTotal(price);

  return (
    <Dialog>
      <DialogTrigger asChild><Button><Check />{t("cta")}</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title", { name: coachName })}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <p className="rounded-lg bg-muted p-3 text-center font-medium">{t("summary", { price, fee: INSURANCE_FEE, total })}</p>
        <DialogFooter>
          <Button disabled={pending} onClick={() => run(() => startProposalCheckoutAction(proposalId), { onSuccess: (payUrl) => router.push(payUrl) })}>
            {t("confirm", { total })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
