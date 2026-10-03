"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/shared/field-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { requestWithdrawalAction } from "@/features/wallet/actions";
import { withdrawalSchema, type WithdrawalInput } from "@/lib/validations/forms";
import { useAction } from "@/lib/use-action";

export function WithdrawForm({ available }: { available: number }) {
  const t = useTranslations("wallet.withdraw");
  const { pending, run } = useAction();
  const form = useForm<WithdrawalInput>({ resolver: zodResolver(withdrawalSchema), defaultValues: { amount: available > 0 ? available : 0 } });
  const { errors } = form.formState;

  return (
    <form onSubmit={form.handleSubmit((v) => run(() => requestWithdrawalAction(v), { success: t("requested") }))} className="flex flex-col gap-3 sm:flex-row sm:items-end" noValidate>
      <div className="grid flex-1 gap-2">
        <Label htmlFor="amount">{t("amount")}</Label>
        <Input id="amount" type="number" inputMode="numeric" min={1} max={available} {...form.register("amount", { valueAsNumber: true })} aria-invalid={!!errors.amount} />
        <FieldError message={errors.amount?.message} />
        <p className="text-xs text-muted-foreground">{t("available", { available })}</p>
      </div>
      <SubmitButton pending={pending} disabled={available <= 0} className="sm:mb-6">{t("submit")}</SubmitButton>
    </form>
  );
}
