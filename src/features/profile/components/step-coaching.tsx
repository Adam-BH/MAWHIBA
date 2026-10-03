"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChipToggleGroup } from "@/components/shared/chip-toggle-group";
import { FieldError } from "@/components/shared/field-error";
import { saveCoachingStepAction } from "@/features/profile/actions";
import { suggestBioAction } from "@/features/profile/ai-bio";
import { StepNav } from "@/features/profile/components/step-nav";
import { useDraftSync, useWizard } from "@/features/profile/components/wizard-context";
import { BIO_MAX, CITIES, SOCIAL_NETWORKS } from "@/lib/config";
import { coachingStepSchema, type CoachingStepInput } from "@/lib/validations/profile-builder";
import { useAction } from "@/lib/use-action";

export function StepCoaching() {
  const t = useTranslations("builder.coaching");
  const { coach, offersCount, aiEnabled, markSaved, next } = useWizard();
  const { pending, run } = useAction();
  const ai = useAction();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const socials = coach.socials;
  const form = useForm<CoachingStepInput>({
    resolver: zodResolver(coachingStepSchema),
    defaultValues: {
      bio: coach.bio ?? "",
      zones: coach.zones.filter((z): z is CoachingStepInput["zones"][number] => (CITIES as readonly string[]).includes(z)),
      videoUrl: coach.video_url ?? "",
      socials: { instagram: socials.instagram ?? "", facebook: socials.facebook ?? "", tiktok: socials.tiktok ?? "", linkedin: socials.linkedin ?? "" },
      price: coach.price_per_session,
      duration: coach.session_duration_min,
    },
  });
  const { errors } = form.formState;
  const v = form.watch();
  useDraftSync({
    strength: { bioLength: v.bio.trim().length, zones: v.zones.length, video: !!v.videoUrl, socials: Object.values(v.socials).filter(Boolean).length },
  });

  function addPrompt(key: "prompt1" | "prompt2" | "prompt3") {
    const current = form.getValues("bio");
    form.setValue("bio", `${current}${current && !current.endsWith("\n") ? "\n\n" : ""}${t(key)} : `, { shouldDirty: true });
  }

  return (
    <form onSubmit={form.handleSubmit((values) => run(() => saveCoachingStepAction(values), { onSuccess: () => { markSaved(); next(); } }))}
      className="grid gap-5" noValidate>
      <div className="grid gap-2">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <Label htmlFor="bio">{t("bio")}</Label>
          <span className={v.bio.length > BIO_MAX ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>{v.bio.length}/{BIO_MAX}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["prompt1", "prompt2", "prompt3"] as const).map((k) => (
            <button key={k} type="button" onClick={() => addPrompt(k)} className="rounded-full bg-secondary px-3 py-1 text-xs text-primary hover:bg-secondary/70">
              + {t(k)}
            </button>
          ))}
        </div>
        <Textarea id="bio" rows={8} {...form.register("bio")} aria-invalid={!!errors.bio} placeholder={t("bioPlaceholder")} />
        <FieldError message={errors.bio?.message} />
        {aiEnabled && (
          <div className="grid gap-2">
            <Button type="button" variant="outline" className="justify-self-start" disabled={ai.pending}
              onClick={() => ai.run(() => suggestBioAction(form.getValues("bio")), { onSuccess: setSuggestions })}>
              <Sparkles className="text-accent" />{ai.pending ? t("aiLoading") : t("aiImprove")}
            </Button>
            {suggestions.map((s, i) => (
              <div key={i} className="rounded-lg border bg-muted/50 p-3 text-sm">
                <p className="whitespace-pre-line">{s}</p>
                <Button type="button" size="sm" variant="ghost" className="mt-1"
                  onClick={() => { form.setValue("bio", s, { shouldDirty: true }); setSuggestions([]); }}>{t("aiUse")}</Button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="grid gap-2">
        <Label>{t("zones")}</Label>
        <Controller control={form.control} name="zones" render={({ field }) => (
          <ChipToggleGroup ariaLabel={t("zones")} options={CITIES} value={field.value} onChange={(x) => field.onChange(x as CoachingStepInput["zones"])} />
        )} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="videoUrl">{t("video")}</Label>
          <Input id="videoUrl" type="url" placeholder="https://youtu.be/…" {...form.register("videoUrl")} aria-invalid={!!errors.videoUrl} />
          <FieldError message={errors.videoUrl ? t("videoInvalid") : undefined} />
        </div>
        {SOCIAL_NETWORKS.map((n) => (
          <div key={n} className="grid gap-2">
            <Label htmlFor={`social-${n}`}>{t(`socials.${n}`)}</Label>
            <Input id={`social-${n}`} placeholder="@pseudo" {...form.register(`socials.${n}`)} aria-invalid={!!errors.socials?.[n]} />
            <FieldError message={errors.socials?.[n] ? t("handleInvalid") : undefined} />
          </div>
        ))}
        <div className="grid gap-2">
          <Label htmlFor="price">{t("price")}</Label>
          <Input id="price" type="number" inputMode="numeric" readOnly={offersCount > 0} className={offersCount > 0 ? "bg-muted" : undefined}
            {...form.register("price", { valueAsNumber: true })} aria-invalid={!!errors.price} />
          {offersCount > 0 && <p className="text-xs text-muted-foreground">{t("priceFromOffers")}</p>}
          <FieldError message={errors.price?.message} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="duration">{t("duration")}</Label>
          <Input id="duration" type="number" step={15} {...form.register("duration", { valueAsNumber: true })} aria-invalid={!!errors.duration} />
          <FieldError message={errors.duration?.message} />
        </div>
      </div>
      <StepNav pending={pending} />
    </form>
  );
}
