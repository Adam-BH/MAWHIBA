"use client";

import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/shared/field-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { createProposalAction } from "@/features/proposals/actions";
import { formatDateTime } from "@/lib/dates";
import { isOutOfBudget } from "@/lib/request-rules";
import { proposalSchema, type ProposalInput } from "@/lib/validations/requests";
import { useAction } from "@/lib/use-action";

type Slot = { id: string; starts_at: string; location: string };

export function ProposalForm({ requestId, slots, defaultPrice, budget }: {
  requestId: string;
  slots: Slot[];
  defaultPrice: number;
  budget: { min: number; max: number };
}) {
  const t = useTranslations("proposals.form");
  const tv = useTranslations("requests.validation");
  const { pending, run } = useAction();
  const form = useForm<ProposalInput>({
    resolver: zodResolver(proposalSchema(tv("contact"))),
    defaultValues: { requestId, slotId: slots[0]?.id ?? "", price: defaultPrice, message: "" },
  });
  const { errors } = form.formState;
  const price = form.watch("price");

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-start gap-2 text-sm">
        <p className="text-muted-foreground">{t("noSlots")}</p>
        <Button asChild size="sm"><Link href="/slots">{t("createSlot")}</Link></Button>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit((v) => run(() => createProposalAction(v), { success: t("sent") }))} className="grid gap-4" noValidate>
      <div className="grid gap-2">
        <Label>{t("slot")}</Label>
        <Controller control={form.control} name="slotId" render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className="w-full" aria-label={t("slot")}><SelectValue /></SelectTrigger>
            <SelectContent>
              {slots.map((s) => <SelectItem key={s.id} value={s.id}><span className="capitalize">{formatDateTime(s.starts_at)}</span> · {s.location}</SelectItem>)}
            </SelectContent>
          </Select>
        )} />
        <Link href="/slots" className="text-xs text-primary underline">{t("otherSlot")}</Link>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="proposal-price">{t("price")}</Label>
        <div className="flex items-center gap-2">
          <Input id="proposal-price" type="number" inputMode="numeric" className="max-w-32" {...form.register("price", { valueAsNumber: true })} aria-invalid={!!errors.price} />
          {Number.isInteger(price) && isOutOfBudget(price, budget.min, budget.max) && (
            <Badge className="border-transparent bg-warning/20 text-warning-foreground">{t("outOfBudget")}</Badge>
          )}
        </div>
        <FieldError message={errors.price?.message} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="proposal-message">{t("message")}</Label>
        <Textarea id="proposal-message" rows={4} maxLength={600} placeholder={t("messagePlaceholder")} {...form.register("message")} aria-invalid={!!errors.message} />
        <FieldError message={errors.message?.message} />
      </div>
      <div className="sticky bottom-16 z-10 -mx-1 bg-card px-1 py-2 md:static md:p-0">
        <SubmitButton pending={pending} size="lg" className="w-full sm:w-auto"><Send />{t("submit")}</SubmitButton>
      </div>
    </form>
  );
}
