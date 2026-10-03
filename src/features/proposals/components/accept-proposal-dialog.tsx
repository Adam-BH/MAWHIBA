"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { acceptProposalAction } from "@/features/proposals/actions";
import { INSURANCE_FEE } from "@/lib/config";
import { checkoutTotal } from "@/lib/money";
import { useAction } from "@/lib/use-action";

export function AcceptProposalDialog({ proposalId, price, coachName, balance }: {
  proposalId: string;
  price: number;
  coachName: string;
  balance: number;
}) {
  const t = useTranslations("proposals.accept");
  const router = useRouter();
  const { pending, run } = useAction();
  const total = checkoutTotal(price);
  const short = balance < total;

  return (
    <Dialog>
      <DialogTrigger asChild><Button><Check />{t("cta")}</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title", { name: coachName })}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <p className="rounded-lg bg-muted p-3 text-center font-medium">{t("summary", { price, fee: INSURANCE_FEE, total })}</p>
        {short ? (
          <Alert variant="destructive">
            <AlertDescription>
              {t("lowBalance", { balance, total })}
              <Button asChild size="sm" className="mt-2"><Link href="/wallet">{t("topup")}</Link></Button>
            </AlertDescription>
          </Alert>
        ) : (
          <p className="text-center text-sm text-muted-foreground">{t("balanceAfter", { after: balance - total })}</p>
        )}
        <DialogFooter>
          <Button disabled={pending || short}
            onClick={() => run(() => acceptProposalAction(proposalId), { success: t("done"), onSuccess: () => router.push("/sessions") })}>
            {t("confirm", { total })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
