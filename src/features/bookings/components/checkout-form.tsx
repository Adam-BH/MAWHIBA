"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/shared/submit-button";
import { bookSlotAction } from "@/features/bookings/actions";
import { useAction } from "@/lib/use-action";

export function CheckoutForm({ slotId, total, balance }: { slotId: string; total: number; balance: number }) {
  const t = useTranslations("checkout");
  const router = useRouter();
  const [note, setNote] = useState("");
  const { pending, run } = useAction();
  const short = balance < total;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    run(() => bookSlotAction({ slotId, note }), { success: t("booked"), onSuccess: () => router.push("/sessions") });
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
      {short ? (
        <Alert variant="destructive">
          <Wallet />
          <AlertTitle>{t("lowBalance")}</AlertTitle>
          <AlertDescription>
            {t("lowBalanceText", { balance, total })}
            <Button asChild size="sm" className="mt-2"><Link href="/wallet">{t("topup")}</Link></Button>
          </AlertDescription>
        </Alert>
      ) : (
        <SubmitButton pending={pending} size="lg" className="w-full">{t("confirm", { total })}</SubmitButton>
      )}
    </form>
  );
}
