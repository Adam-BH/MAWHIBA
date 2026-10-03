"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/shared/field-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { createRequestAction } from "@/features/requests/actions";
import { RequestCard } from "@/features/requests/components/request-card";
import { CITIES, REQUEST_AUDIENCES, SKILL_LEVELS, SPORTS } from "@/lib/config";
import { requestSchema, type RequestInput } from "@/lib/validations/requests";
import { useAction } from "@/lib/use-action";

function Choice<T extends string>({ value, onChange, options, label }: {
  value: T;
  onChange: (v: T) => void;
  options: readonly { value: T; label: string }[];
  label: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as T)}>
      <SelectTrigger className="w-full" aria-label={label}><SelectValue /></SelectTrigger>
      <SelectContent>{options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
    </Select>
  );
}

export function RequestForm({ defaults, firstName }: { defaults: RequestInput; firstName: string }) {
  const t = useTranslations("requests");
  const router = useRouter();
  const { pending, run } = useAction();
  const schema = requestSchema({ contact: t("validation.contact"), budget: t("validation.budget"), childAge: t("validation.childAge") });
  const form = useForm<RequestInput>({ resolver: zodResolver(schema), defaultValues: defaults });
  const { errors } = form.formState;
  const v = form.watch();
  const num = { setValueAs: (x: string) => (x === "" ? undefined : Number(x)) };
  const options = <T extends string>(values: readonly T[], label: (v: T) => string) => values.map((value) => ({ value, label: label(value) }));

  const onSubmit = form.handleSubmit((values) =>
    run(() => createRequestAction(values), { success: t("published"), onSuccess: (id) => router.push(`/requests/${id}`) }),
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <form onSubmit={onSubmit} className="grid gap-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>{t("form.sport")}</Label>
            <Controller control={form.control} name="sport" render={({ field }) => (
              <Choice value={field.value} onChange={field.onChange} label={t("form.sport")} options={options(SPORTS, (s) => s)} />
            )} />
          </div>
          <div className="grid gap-2">
            <Label>{t("form.city")}</Label>
            <Controller control={form.control} name="city" render={({ field }) => (
              <Choice value={field.value} onChange={field.onChange} label={t("form.city")} options={options(CITIES, (c) => c)} />
            )} />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="req-title">{t("form.title")}</Label>
          <Input id="req-title" placeholder={t("form.titlePlaceholder")} {...form.register("title")} aria-invalid={!!errors.title} />
          <FieldError message={errors.title?.message} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="req-description">{t("form.description")}</Label>
          <Textarea id="req-description" rows={4} placeholder={t("form.descriptionPlaceholder")} {...form.register("description")} aria-invalid={!!errors.description} />
          <FieldError message={errors.description?.message} />
          <p className="text-xs text-muted-foreground">{t("form.privacyHint")}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>{t("form.audience")}</Label>
            <Controller control={form.control} name="audience" render={({ field }) => (
              <Choice value={field.value} onChange={field.onChange} label={t("form.audience")} options={options(REQUEST_AUDIENCES, (a) => t(`audience.${a}`))} />
            )} />
          </div>
          {v.audience === "enfant" ? (
            <div className="grid gap-2">
              <Label htmlFor="req-age">{t("form.childAge")}</Label>
              <Input id="req-age" type="number" min={1} max={17} {...form.register("childAge", num)} aria-invalid={!!errors.childAge} />
              <FieldError message={errors.childAge?.message} />
            </div>
          ) : <div />}
          <div className="grid gap-2">
            <Label>{t("form.level")}</Label>
            <Controller control={form.control} name="level" render={({ field }) => (
              <Choice value={field.value} onChange={field.onChange} label={t("form.level")} options={options(SKILL_LEVELS, (l) => t(`level.${l}`))} />
            )} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="req-schedule">{t("form.schedule")}</Label>
            <Input id="req-schedule" placeholder={t("form.schedulePlaceholder")} {...form.register("scheduleNote")} aria-invalid={!!errors.scheduleNote} />
            <FieldError message={errors.scheduleNote?.message} />
          </div>
        </div>
        <Label className="flex items-center gap-2 font-normal">
          <Controller control={form.control} name="specialNeeds" render={({ field }) => (
            <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} />
          )} />
          {t("form.specialNeeds")}
        </Label>
        {v.specialNeeds && (
          <div className="grid gap-2">
            <Label htmlFor="req-needs">{t("form.specialNeedsNote")}</Label>
            <Input id="req-needs" placeholder={t("form.specialNeedsPlaceholder")} {...form.register("specialNeedsNote")} aria-invalid={!!errors.specialNeedsNote} />
            <FieldError message={errors.specialNeedsNote?.message} />
          </div>
        )}
        <fieldset className="grid gap-2">
          <legend className="mb-2 text-sm font-medium">{t("form.budget")}</legend>
          <div className="flex items-center gap-2">
            <Input type="number" inputMode="numeric" aria-label={t("form.budgetMin")} className="max-w-28" {...form.register("budget.min", { valueAsNumber: true })} />
            <span className="text-muted-foreground">–</span>
            <Input type="number" inputMode="numeric" aria-label={t("form.budgetMax")} className="max-w-28" {...form.register("budget.max", { valueAsNumber: true })} />
            <span className="text-sm text-muted-foreground">{t("form.perSession")}</span>
          </div>
          <FieldError message={errors.budget?.max?.message ?? errors.budget?.min?.message ?? errors.budget?.message} />
        </fieldset>
        <SubmitButton pending={pending} size="lg" className="justify-self-start">{t("form.submit")}</SubmitButton>
      </form>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <p className="mb-2 text-sm font-medium text-muted-foreground">{t("form.preview")}</p>
        <RequestCard detailed request={{
          sport: v.sport, city: v.city, title: v.title || t("form.titlePlaceholder"), description: v.description,
          audience: v.audience, child_age: v.childAge ?? null, level: v.level, special_needs: v.specialNeeds,
          special_needs_note: v.specialNeeds ? v.specialNeedsNote : null, schedule_note: v.scheduleNote,
          budget_min: v.budget?.min || 0, budget_max: v.budget?.max || 0, status: "open",
          expires_at: null, client_first_name: firstName, proposals_count: 0,
        }} />
      </aside>
    </div>
  );
}
