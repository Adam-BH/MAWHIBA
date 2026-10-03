"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/shared/field-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { CitySelect } from "@/features/coaches/components/city-select";
import { updateProfileAction } from "@/features/coaches/actions";
import { profileSchema, type ProfileInput } from "@/lib/validations/profile";
import { useAction } from "@/lib/use-action";

export function ProfileForm({ defaults }: { defaults: ProfileInput }) {
  const t = useTranslations("profile");
  const { pending, run } = useAction();
  const form = useForm<ProfileInput>({ resolver: zodResolver(profileSchema), defaultValues: defaults });
  const { errors } = form.formState;

  return (
    <form onSubmit={form.handleSubmit((v) => run(() => updateProfileAction(v), { success: t("saved") }))} className="grid gap-4" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="fullName">{t("fullName")}</Label>
        <Input id="fullName" {...form.register("fullName")} aria-invalid={!!errors.fullName} />
        <FieldError message={errors.fullName?.message} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="phone">{t("phone")}</Label>
          <Input id="phone" type="tel" {...form.register("phone")} aria-invalid={!!errors.phone} />
          <FieldError message={errors.phone?.message} />
        </div>
        <div className="grid gap-2">
          <Label>{t("city")}</Label>
          <Controller control={form.control} name="city" render={({ field }) => <CitySelect value={field.value} onChange={field.onChange} />} />
        </div>
      </div>
      <SubmitButton pending={pending} className="justify-self-start">{t("save")}</SubmitButton>
    </form>
  );
}
