"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/shared/field-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { createSlotAction } from "@/features/slots/actions";
import { slotSchema, type SlotInput } from "@/lib/validations/slot";
import { useAction } from "@/lib/use-action";

export function SlotForm({ defaults, onCreated }: { defaults: SlotInput; onCreated?: () => void }) {
  const t = useTranslations("slots");
  const { pending, run } = useAction();
  const form = useForm<SlotInput>({ resolver: zodResolver(slotSchema), defaultValues: defaults });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((values) =>
    run(() => createSlotAction(values), {
      onSuccess: (count) => {
        toast.success(t("created", { count }));
        form.reset({ ...values, weekly: false });
        onCreated?.();
      },
    }),
  );

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="date">{t("date")}</Label>
          <Input id="date" type="date" {...form.register("date")} aria-invalid={!!errors.date} />
          <FieldError message={errors.date?.message} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="time">{t("time")}</Label>
          <Input id="time" type="time" step={900} {...form.register("time")} aria-invalid={!!errors.time} />
          <FieldError message={errors.time?.message} />
        </div>
        <div className="col-span-2 grid gap-2 sm:col-span-1">
          <Label htmlFor="duration">{t("duration")}</Label>
          <Input id="duration" type="number" step={15} {...form.register("duration", { valueAsNumber: true })} aria-invalid={!!errors.duration} />
          <FieldError message={errors.duration?.message} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="location">{t("location")}</Label>
        <Input id="location" placeholder={t("locationPlaceholder")} {...form.register("location")} aria-invalid={!!errors.location} />
        <FieldError message={errors.location?.message} />
      </div>
      <Label className="flex items-center gap-2 font-normal">
        <Controller control={form.control} name="weekly" render={({ field }) => (
          <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} />
        )} />
        {t("weekly")}
      </Label>
      <SubmitButton pending={pending} className="justify-self-start">{t("create")}</SubmitButton>
    </form>
  );
}
