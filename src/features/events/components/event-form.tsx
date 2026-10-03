"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/shared/field-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { createEventAction } from "@/features/events/actions";
import { eventSchema, type EventInput } from "@/lib/validations/event";
import { useAction } from "@/lib/use-action";

const DEFAULTS: EventInput = { title: "", description: "", date: "", time: "09:00", duration: 180, location: "", capacity: 50 };

export function EventForm() {
  const t = useTranslations("events.form");
  const { pending, run } = useAction();
  const form = useForm<EventInput>({ resolver: zodResolver(eventSchema), defaultValues: DEFAULTS });
  const { errors } = form.formState;
  const onSubmit = form.handleSubmit((values) => run(() => createEventAction(values), { success: t("created"), onSuccess: () => form.reset(DEFAULTS) }));

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="title">{t("title")}</Label>
        <Input id="title" placeholder={t("titlePlaceholder")} {...form.register("title")} aria-invalid={!!errors.title} />
        <FieldError message={errors.title?.message} />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
        <div className="grid gap-2">
          <Label htmlFor="duration">{t("duration")}</Label>
          <Input id="duration" type="number" step={30} {...form.register("duration", { valueAsNumber: true })} aria-invalid={!!errors.duration} />
          <FieldError message={errors.duration?.message} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="capacity">{t("capacity")}</Label>
          <Input id="capacity" type="number" {...form.register("capacity", { valueAsNumber: true })} aria-invalid={!!errors.capacity} />
          <FieldError message={errors.capacity?.message} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="location">{t("location")}</Label>
        <Input id="location" {...form.register("location")} aria-invalid={!!errors.location} />
        <FieldError message={errors.location?.message} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">{t("description")}</Label>
        <Textarea id="description" rows={4} {...form.register("description")} aria-invalid={!!errors.description} />
        <FieldError message={errors.description?.message} />
      </div>
      <SubmitButton pending={pending} className="justify-self-start">{t("submit")}</SubmitButton>
    </form>
  );
}
