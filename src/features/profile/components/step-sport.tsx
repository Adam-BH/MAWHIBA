"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChipToggleGroup } from "@/components/shared/chip-toggle-group";
import { FieldError } from "@/components/shared/field-error";
import { saveSportAction } from "@/features/profile/actions";
import { StepNav } from "@/features/profile/components/step-nav";
import { useDraftSync, useWizard } from "@/features/profile/components/wizard-context";
import { ACHIEVEMENT_LEVELS, ATHLETE_STATUSES, SPORTS, type Sport } from "@/lib/config";
import { cn } from "@/lib/utils";
import { sportStepSchema, type SportStepInput } from "@/lib/validations/profile-builder";
import { useAction } from "@/lib/use-action";

export function StepSport() {
  const t = useTranslations("builder.sport");
  const tl = useTranslations("levels");
  const { coach, markSaved, next } = useWizard();
  const { pending, run } = useAction();
  const primary = (coach.primary_sport ?? coach.sports[0] ?? "Natation") as Sport;
  const form = useForm<SportStepInput>({
    resolver: zodResolver(sportStepSchema),
    defaultValues: {
      primarySport: primary,
      otherSports: coach.sports.filter((s): s is Sport => s !== primary && (SPORTS as readonly string[]).includes(s)),
      athleteStatus: coach.athlete_status ?? "actif",
      yearsPractice: coach.years_practice ?? undefined,
      highestLevel: coach.highest_level ?? "regional",
    },
  });
  const { errors } = form.formState;
  const v = form.watch();
  useDraftSync({
    card: { sport: v.primarySport, level: v.highestLevel, years: Number.isFinite(v.yearsPractice) ? v.yearsPractice ?? null : null },
    strength: { primarySport: true, athleteStatus: true, highestLevel: true, yearsPractice: Number.isFinite(v.yearsPractice) },
  });

  return (
    <form onSubmit={form.handleSubmit((values) => run(() => saveSportAction(values), { onSuccess: () => { markSaved(); next(); } }))}
      className="grid gap-5" noValidate>
      <div className="grid gap-2 sm:max-w-xs">
        <Label>{t("primary")}</Label>
        <Controller control={form.control} name="primarySport" render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className="w-full" aria-label={t("primary")}><SelectValue /></SelectTrigger>
            <SelectContent>{SPORTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        )} />
      </div>
      <div className="grid gap-2">
        <Label>{t("others")}</Label>
        <Controller control={form.control} name="otherSports" render={({ field }) => (
          <ChipToggleGroup ariaLabel={t("others")} max={3} options={SPORTS.filter((s) => s !== v.primarySport)}
            value={field.value.filter((s) => s !== v.primarySport)} onChange={(x) => field.onChange(x as Sport[])} />
        )} />
      </div>
      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-medium">{t("status")}</legend>
        <Controller control={form.control} name="athleteStatus" render={({ field }) => (
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t("status")}>
            {ATHLETE_STATUSES.map((s) => (
              <button key={s} type="button" role="radio" aria-checked={field.value === s} onClick={() => field.onChange(s)}
                className={cn("rounded-xl border-2 p-3 text-sm font-medium transition-colors",
                  field.value === s ? "border-primary bg-secondary text-primary" : "bg-card hover:bg-muted")}>
                {t(`statuses.${s}`)}
              </button>
            ))}
          </div>
        )} />
      </fieldset>
      <div className="grid gap-2 sm:max-w-40">
        <Label htmlFor="yearsPractice">{t("yearsPractice")}</Label>
        <Input id="yearsPractice" type="number" min={0} max={80} inputMode="numeric"
          {...form.register("yearsPractice", { setValueAs: (x: string) => (x === "" ? undefined : Number(x)) })} aria-invalid={!!errors.yearsPractice} />
        <FieldError message={errors.yearsPractice?.message} />
      </div>
      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-medium">{t("highestLevel")}</legend>
        <Controller control={form.control} name="highestLevel" render={({ field }) => (
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("highestLevel")}>
            {ACHIEVEMENT_LEVELS.map((l) => (
              <button key={l} type="button" role="radio" aria-checked={field.value === l} onClick={() => field.onChange(l)}
                className={cn("rounded-full border-2 px-3 py-1.5 text-sm font-semibold text-[var(--level-foreground)]",
                  field.value === l ? "border-primary" : "border-transparent opacity-70")}
                style={{ background: `var(--level-${l})` }}>
                {tl(l)}
              </button>
            ))}
          </div>
        )} />
      </fieldset>
      <StepNav pending={pending} />
    </form>
  );
}
