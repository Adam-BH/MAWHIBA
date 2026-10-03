"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/shared/field-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { CitySelect } from "@/features/coaches/components/city-select";
import { updateCoachProfileAction } from "@/features/coaches/actions";
import { SPORTS } from "@/lib/config";
import { cn } from "@/lib/utils";
import { coachProfileSchema, type CoachProfileInput } from "@/lib/validations/profile";
import { useAction } from "@/lib/use-action";

export function CoachProfileForm({ defaults }: { defaults: CoachProfileInput }) {
  const t = useTranslations("profile");
  const { pending, run } = useAction();
  const form = useForm<CoachProfileInput>({ resolver: zodResolver(coachProfileSchema), defaultValues: defaults });
  const { errors } = form.formState;

  return (
    <form onSubmit={form.handleSubmit((v) => run(() => updateCoachProfileAction(v), { success: t("saved") }))} className="grid gap-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="fullName">{t("fullName")}</Label>
          <Input id="fullName" {...form.register("fullName")} aria-invalid={!!errors.fullName} />
          <FieldError message={errors.fullName?.message} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">{t("phone")}</Label>
          <Input id="phone" type="tel" {...form.register("phone")} />
          <FieldError message={errors.phone?.message} />
        </div>
        <div className="grid gap-2">
          <Label>{t("city")}</Label>
          <Controller control={form.control} name="city" render={({ field }) => <CitySelect value={field.value} onChange={field.onChange} />} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="price">{t("price")}</Label>
            <Input id="price" type="number" inputMode="numeric" {...form.register("price", { valueAsNumber: true })} aria-invalid={!!errors.price} />
            <FieldError message={errors.price?.message} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="duration">{t("duration")}</Label>
            <Input id="duration" type="number" inputMode="numeric" step={15} {...form.register("duration", { valueAsNumber: true })} />
            <FieldError message={errors.duration?.message} />
          </div>
        </div>
      </div>

      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-medium">{t("sports")}</legend>
        <Controller control={form.control} name="sports" render={({ field }) => (
          <div className="flex flex-wrap gap-2">
            {SPORTS.map((sport) => {
              const on = field.value.includes(sport);
              return (
                <button key={sport} type="button" aria-pressed={on}
                  onClick={() => field.onChange(on ? field.value.filter((s) => s !== sport) : [...field.value, sport])}
                  className={cn("rounded-full border px-3 py-1.5 text-sm transition-colors",
                    on ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted")}>
                  {sport}
                </button>
              );
            })}
          </div>
        )} />
        <FieldError message={errors.sports?.message} />
      </fieldset>

      <div className="grid gap-2">
        <Label htmlFor="headline">{t("headline")}</Label>
        <Input id="headline" placeholder={t("headlinePlaceholder")} {...form.register("headline")} aria-invalid={!!errors.headline} />
        <FieldError message={errors.headline?.message} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="achievements">{t("achievements")}</Label>
        <Textarea id="achievements" rows={3} placeholder={t("achievementsPlaceholder")} {...form.register("achievements")} />
        <FieldError message={errors.achievements?.message} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="bio">{t("bio")}</Label>
        <Textarea id="bio" rows={5} {...form.register("bio")} />
        <FieldError message={errors.bio?.message} />
      </div>
      <SubmitButton pending={pending} size="lg" className="justify-self-start">{t("save")}</SubmitButton>
    </form>
  );
}
