"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChipToggleGroup } from "@/components/shared/chip-toggle-group";
import { EmptyState } from "@/components/shared/empty-state";
import { FieldError } from "@/components/shared/field-error";
import { saveCoachingInfoAction } from "@/features/profile/actions";
import { deleteItemAction, saveExperienceAction } from "@/features/profile/item-actions";
import { ItemFormDialog, type FieldSpec } from "@/features/profile/components/item-form-dialog";
import { StepNav } from "@/features/profile/components/step-nav";
import { useDraftSync, useWizard } from "@/features/profile/components/wizard-context";
import { SPECIALTIES } from "@/lib/config";
import { coachingInfoSchema, experienceSchema, type CoachingInfoInput } from "@/lib/validations/profile-builder";
import { useAction } from "@/lib/use-action";

export function StepExperience() {
  const t = useTranslations("builder.experience");
  const { coach, markSaved, next } = useWizard();
  const { pending, run } = useAction();
  const form = useForm<CoachingInfoInput>({
    resolver: zodResolver(coachingInfoSchema),
    defaultValues: { yearsCoaching: coach.years_coaching ?? undefined, specialties: coach.specialties },
  });
  const v = form.watch();
  useDraftSync({ strength: { yearsCoaching: Number.isFinite(v.yearsCoaching), specialties: v.specialties.length } });

  const fields: FieldSpec[] = [
    { name: "role", label: t("role"), type: "text", placeholder: t("rolePlaceholder") },
    { name: "organization", label: t("organization"), type: "text", placeholder: t("organizationPlaceholder") },
    { name: "startDate", label: t("startDate"), type: "date" },
    { name: "endDate", label: t("endDate"), type: "date", optional: true },
    { name: "description", label: t("description"), type: "textarea", optional: true },
  ];
  const addButton = (
    <ItemFormDialog title={t("add")} fields={fields} schema={experienceSchema} onSave={(x) => saveExperienceAction(x)}
      trigger={<Button type="button" variant="outline"><Plus />{t("add")}</Button>} />
  );

  return (
    <form onSubmit={form.handleSubmit((values) => run(() => saveCoachingInfoAction(values), { onSuccess: () => { markSaved(); next(); } }))}
      className="grid gap-5" noValidate>
      {coach.experiences.length === 0 ? <EmptyState title={t("empty")} action={addButton} /> : (
        <>
          <ul className="flex flex-col gap-2">
            {coach.experiences.map((e) => (
              <li key={e.id} className="flex items-start gap-2 rounded-xl border bg-card p-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{e.role} · <span className="text-primary">{e.organization}</span></p>
                  <p className="text-sm text-muted-foreground">{e.start_date.slice(0, 4)}-{e.end_date ? e.end_date.slice(0, 4) : t("today")}</p>
                  {e.description && <p className="mt-1 text-sm">{e.description}</p>}
                </div>
                <ItemFormDialog title={t("edit")} fields={fields} schema={experienceSchema}
                  defaults={{ role: e.role, organization: e.organization, startDate: e.start_date, endDate: e.end_date ?? "", description: e.description }}
                  onSave={(x) => saveExperienceAction(x, e.id)}
                  trigger={<Button type="button" variant="ghost" size="icon-sm" aria-label={t("edit")}><Pencil /></Button>} />
                <Button type="button" variant="ghost" size="icon-sm" aria-label={t("delete")}
                  onClick={() => confirm(t("deleteConfirm")) && run(() => deleteItemAction("coaching_experiences", e.id))}><Trash2 /></Button>
              </li>
            ))}
          </ul>
          <div>{addButton}</div>
        </>
      )}
      <div className="grid gap-2 sm:max-w-40">
        <Label htmlFor="yearsCoaching">{t("yearsCoaching")}</Label>
        <Input id="yearsCoaching" type="number" min={0} max={80} inputMode="numeric"
          {...form.register("yearsCoaching", { setValueAs: (x: string) => (x === "" ? undefined : Number(x)) })} />
        <FieldError message={form.formState.errors.yearsCoaching?.message} />
      </div>
      <div className="grid gap-2">
        <Label>{t("specialties")}</Label>
        <Controller control={form.control} name="specialties" render={({ field }) => (
          <ChipToggleGroup ariaLabel={t("specialties")} options={SPECIALTIES} value={field.value} onChange={field.onChange} max={10} addLabel={t("addSpecialty")} />
        )} />
      </div>
      <StepNav pending={pending} />
    </form>
  );
}
