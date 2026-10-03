"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Coins } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/shared/field-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { adminCreditAction } from "@/features/admin/actions";
import { creditSchema, type CreditInput } from "@/lib/validations/forms";
import { useAction } from "@/lib/use-action";

export function CreditDialog({ userId, name }: { userId: string; name: string }) {
  const t = useTranslations("admin.wallets");
  const [open, setOpen] = useState(false);
  const { pending, run } = useAction();
  const form = useForm<CreditInput>({ resolver: zodResolver(creditSchema), defaultValues: { userId, amount: 50, reason: t("defaultReason") } });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((v) => run(() => adminCreditAction(v), { success: t("credited"), onSuccess: () => setOpen(false) }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm"><Coins />{t("credit")}</Button></DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          <DialogHeader>
            <DialogTitle>{t("creditTitle")}</DialogTitle>
            <DialogDescription>{name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="amount">{t("amount")}</Label>
            <Input id="amount" type="number" inputMode="numeric" {...form.register("amount", { valueAsNumber: true })} aria-invalid={!!errors.amount} />
            <FieldError message={errors.amount?.message} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reason">{t("reason")}</Label>
            <Input id="reason" {...form.register("reason")} aria-invalid={!!errors.reason} />
            <FieldError message={errors.reason?.message} />
          </div>
          <DialogFooter><SubmitButton pending={pending}>{t("confirmCredit")}</SubmitButton></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
