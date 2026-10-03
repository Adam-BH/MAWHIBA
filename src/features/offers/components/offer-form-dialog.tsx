"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/shared/field-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { saveOfferAction } from "@/features/offers/actions";
import { OFFER_AUDIENCES, SPORTS } from "@/lib/config";
import { offerSchema, type OfferInput } from "@/lib/validations/offers";
import { useAction } from "@/lib/use-action";

export function OfferFormDialog({ trigger, defaults, offerId, canInclusive }: {
  trigger: React.ReactNode;
  defaults: OfferInput;
  offerId?: string;
  canInclusive: boolean;
}) {
  const t = useTranslations("offers");
  const [open, setOpen] = useState(false);
  const { pending, run } = useAction();
  const form = useForm<OfferInput>({ resolver: zodResolver(offerSchema), defaultValues: defaults });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((v) =>
    run(() => saveOfferAction(v, offerId), { success: t("saved"), onSuccess: () => { setOpen(false); if (!offerId) form.reset(defaults); } }),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          <DialogHeader><DialogTitle>{offerId ? t("editTitle") : t("newTitle")}</DialogTitle></DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="offer-title">{t("title")}</Label>
            <Input id="offer-title" placeholder={t("titlePlaceholder")} {...form.register("title")} aria-invalid={!!errors.title} />
            <FieldError message={errors.title?.message} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>{t("sport")}</Label>
              <Controller control={form.control} name="sport" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full" aria-label={t("sport")}><SelectValue /></SelectTrigger>
                  <SelectContent>{SPORTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              )} />
            </div>
            <div className="grid gap-2">
              <Label>{t("audienceLabel")}</Label>
              <Controller control={form.control} name="audience" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full" aria-label={t("audienceLabel")}><SelectValue /></SelectTrigger>
                  <SelectContent>{OFFER_AUDIENCES.map((a) => <SelectItem key={a} value={a}>{t(`audience.${a}`)}</SelectItem>)}</SelectContent>
                </Select>
              )} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="offer-duration">{t("durationLabel")}</Label>
              <Input id="offer-duration" type="number" step={15} {...form.register("duration", { valueAsNumber: true })} aria-invalid={!!errors.duration} />
              <FieldError message={errors.duration?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="offer-price">{t("priceLabel")}</Label>
              <Input id="offer-price" type="number" inputMode="numeric" {...form.register("price", { valueAsNumber: true })} aria-invalid={!!errors.price} />
              <FieldError message={errors.price?.message} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="offer-description">{t("description")}</Label>
            <Textarea id="offer-description" rows={3} {...form.register("description")} />
            <FieldError message={errors.description?.message} />
          </div>
          <Label className="flex items-center gap-2 font-normal">
            <Controller control={form.control} name="isInclusive" render={({ field }) => (
              <Checkbox checked={field.value} disabled={!canInclusive} onCheckedChange={(c) => field.onChange(c === true)} />
            )} />
            {canInclusive ? t("inclusiveLabel") : t("inclusiveLocked")}
          </Label>
          <Label className="flex items-center gap-2 font-normal">
            <Controller control={form.control} name="isActive" render={({ field }) => (
              <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} />
            )} />
            {t("activeLabel")}
          </Label>
          <DialogFooter><SubmitButton pending={pending}>{t("save")}</SubmitButton></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
