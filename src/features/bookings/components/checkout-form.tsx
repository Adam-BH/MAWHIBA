"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InsuredBadge } from "@/components/shared/insured-badge";
import { SubmitButton } from "@/components/shared/submit-button";
import { startCheckoutAction } from "@/features/payments/actions";
import { useAction } from "@/lib/use-action";

export function CheckoutForm({ slotId, offerId, total }: { slotId: string; offerId?: string; total: number }) {
  const t = useTranslations("checkout");
  const router = useRouter();
  const [note, setNote] = useState("");
  const { pending, run } = useAction();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    run(() => startCheckoutAction({ slotId, offerId, note }), { onSuccess: (payUrl) => router.push(payUrl) });
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="note">{t("note")}</Label>
        <Textarea id="note" rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("notePlaceholder")} />
      </div>
      <div className="grid gap-2">
        <InsuredBadge className="justify-self-start" />
        <p className="text-sm text-muted-foreground">{t("insuredText")}</p>
      </div>
      <SubmitButton pending={pending} size="lg" className="w-full">{t("pay", { total })}</SubmitButton>
    </form>
  );
}
