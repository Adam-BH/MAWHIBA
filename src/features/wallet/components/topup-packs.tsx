"use client";

import { useState } from "react";
import { CreditCard, Gift } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Points } from "@/components/shared/points";
import { topupAction } from "@/features/wallet/actions";
import { TOPUP_PACKS } from "@/lib/config";
import { useAction } from "@/lib/use-action";

type Pack = (typeof TOPUP_PACKS)[number];

export function TopupPacks() {
  const t = useTranslations("wallet.topup");
  const [selected, setSelected] = useState<Pack | null>(null);
  const { pending, run } = useAction();

  function pay() {
    if (!selected) return;
    run(() => topupAction(selected.id), {
      success: t("success", { points: selected.points }),
      onSuccess: () => setSelected(null),
    });
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        {TOPUP_PACKS.map((pack) => (
          <Card key={pack.id} className="relative">
            <CardContent className="flex flex-col items-center gap-2 text-center">
              {pack.points > pack.pay && (
                <Badge className="absolute top-3 end-3 border-transparent bg-accent text-accent-foreground"><Gift />+{pack.points - pack.pay}</Badge>
              )}
              <Points value={pack.points} className="text-2xl text-primary" />
              <p className="text-sm text-muted-foreground">{t("price", { pay: pack.pay })}</p>
              <Button className="w-full" onClick={() => setSelected(pack)}>{t("choose")}</Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><CreditCard className="text-primary" />{t("flouciTitle")}</DialogTitle>
            <DialogDescription>{t("flouciMock")}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground">{t("amountDue")}</p>
              <p className="text-3xl font-semibold">{t("price", { pay: selected.pay })}</p>
              <p className="mt-1 text-sm">{t("youGet")} <Points value={selected.points} /></p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>{t("cancel")}</Button>
            <Button disabled={pending} onClick={pay}>{t("pay")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
