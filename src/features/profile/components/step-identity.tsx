"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChipToggleGroup } from "@/components/shared/chip-toggle-group";
import { FieldError } from "@/components/shared/field-error";
import { UserAvatar } from "@/components/shared/user-avatar";
import { uploadAvatarAction } from "@/features/coaches/actions";
import { CitySelect } from "@/features/coaches/components/city-select";
import { FileUpload } from "@/features/coaches/components/file-upload";
import { saveIdentityAction, uploadCoverAction } from "@/features/profile/actions";
import { useDraftSync, useWizard } from "@/features/profile/components/wizard-context";
import { StepNav } from "@/features/profile/components/step-nav";
import { CITIES, LANGUAGES } from "@/lib/config";
import { slugify } from "@/lib/slug";
import { publicStorageUrl } from "@/lib/storage-url";
import { identitySchema, type IdentityInput } from "@/lib/validations/profile-builder";
import { useAction } from "@/lib/use-action";

const IMAGE_TYPES = "image/png,image/jpeg,image/webp";

export function StepIdentity() {
  const t = useTranslations("builder.identity");
  const { coach, markSaved, next } = useWizard();
  const { pending, run } = useAction();
  const form = useForm<IdentityInput>({
    resolver: zodResolver(identitySchema),
    defaultValues: {
      fullName: coach.profile.full_name,
      city: CITIES.find((c) => c === coach.profile.city) ?? "",
      tagline: coach.tagline ?? "",
      slug: coach.slug ?? slugify(coach.profile.full_name),
      languages: coach.languages.filter((l): l is IdentityInput["languages"][number] => (LANGUAGES as readonly string[]).includes(l)),
    },
  });
  const { errors } = form.formState;
  const v = form.watch();
  useDraftSync({
    card: { name: v.fullName, city: v.city || null, tagline: v.tagline || null },
    strength: { tagline: !!v.tagline, city: !!v.city, languages: v.languages.length },
  });
  const cover = publicStorageUrl("covers", coach.cover_path);

  return (
    <form onSubmit={form.handleSubmit((values) => run(() => saveIdentityAction(values), { onSuccess: () => { markSaved(); next(); } }))}
      className="grid gap-5" noValidate>
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="relative h-28 bg-muted bg-cover bg-center" style={cover ? { backgroundImage: `url(${cover})` } : undefined}>
          <div className="absolute end-2 bottom-2">
            <FileUpload action={uploadCoverAction} accept={IMAGE_TYPES} label={t("cover")} success={t("coverSaved")} size="sm" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <UserAvatar name={v.fullName} src={coach.profile.avatar_url} className="-mt-12 size-20 ring-4 ring-card" />
          <FileUpload action={uploadAvatarAction} accept={IMAGE_TYPES} label={t("avatar")} success={t("avatarSaved")} size="sm" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="fullName">{t("fullName")}</Label>
          <Input id="fullName" {...form.register("fullName")} aria-invalid={!!errors.fullName} />
          <FieldError message={errors.fullName?.message} />
        </div>
        <div className="grid gap-2">
          <Label>{t("city")}</Label>
          <Controller control={form.control} name="city" render={({ field }) => <CitySelect value={field.value} onChange={field.onChange} />} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="tagline">{t("tagline")} <span className="font-normal text-muted-foreground">({v.tagline.length}/80)</span></Label>
        <Input id="tagline" maxLength={80} placeholder={t("taglinePlaceholder")} {...form.register("tagline")} aria-invalid={!!errors.tagline} />
        <div className="flex flex-wrap gap-2">
          {(["example1", "example2", "example3"] as const).map((k) => (
            <button key={k} type="button" onClick={() => form.setValue("tagline", t(k), { shouldDirty: true })}
              className="rounded-full bg-secondary px-3 py-1 text-start text-xs text-primary hover:bg-secondary/70">
              {t(k)}
            </button>
          ))}
        </div>
        <FieldError message={errors.tagline?.message} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="slug">{t("slug")}</Label>
        <div dir="ltr" className="flex items-center rounded-xl border border-input bg-card ps-3.5 text-sm focus-within:ring-3 focus-within:ring-ring/50">
          <span className="shrink-0 text-muted-foreground">/coaches/</span>
          <input id="slug" className="h-10 min-w-0 flex-1 bg-transparent pe-3.5 outline-none" {...form.register("slug", { setValueAs: (s: string) => slugify(s) })}
            aria-invalid={!!errors.slug} />
        </div>
        <FieldError message={errors.slug?.message} />
      </div>
      <div className="grid gap-2">
        <Label>{t("languages")}</Label>
        <Controller control={form.control} name="languages" render={({ field }) => (
          <ChipToggleGroup ariaLabel={t("languages")} options={LANGUAGES} value={field.value}
            onChange={(v) => field.onChange(v as IdentityInput["languages"])} />
        )} />
      </div>
      <StepNav pending={pending} />
    </form>
  );
}
