"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
      <Alert>
        <ShieldCheck />
        <AlertTitle>{t("insuredTitle")}</AlertTitle>
        <AlertDescription>{t("insuredText")}</AlertDescription>
      </Alert>
      <SubmitButton pending={pending} size="lg" className="w-full">{t("pay", { total })}</SubmitButton>
    </form>
  );
}
