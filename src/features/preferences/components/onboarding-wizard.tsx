"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SubmitButton } from "@/components/shared/submit-button";
import { savePreferencesAction, skipOnboardingAction } from "@/features/preferences/actions";
import { StepBudget, StepSports, StepWhere, StepWho, type StepProps } from "@/features/preferences/components/onboarding-steps";
import type { Preferences } from "@/features/preferences/queries";
import { PREF_BUDGET } from "@/lib/config";
import { useAction } from "@/lib/use-action";
import type { PreferencesInput } from "@/lib/validations/preferences";

const STEPS = [["sports", StepSports], ["who", StepWho], ["where", StepWhere], ["budget", StepBudget]] as const;

function initial(p: Preferences | null, city: string | null): PreferencesInput {
  return {
    sports: (p?.sports ?? []) as PreferencesInput["sports"],
    audience: p?.audience ?? null,
    childAge: p?.child_age ?? null,
    level: p?.level ?? null,
    inclusiveNeeds: p?.inclusive_needs ?? false,
    languages: (p?.languages ?? []) as PreferencesInput["languages"],
    city: (p?.city ?? city) as PreferencesInput["city"],
    point: p?.lat != null && p.lng != null ? { lat: p.lat, lng: p.lng } : null,
    budgetMax: p?.budget_max ?? PREF_BUDGET.default,
    availability: (p?.availability ?? []) as PreferencesInput["availability"],
    goals: (p?.goals ?? []) as PreferencesInput["goals"],
  };
}

/** 4 short steps, one save at the end. "Passer" skips the whole onboarding (or cancels an edit). */
export function OnboardingWizard({ prefs, city, next, edit }: { prefs: Preferences | null; city: string | null; next: string; edit: boolean }) {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const { pending, run } = useAction();
  const [step, setStep] = useState(0);
  const [value, setValue] = useState(() => initial(prefs, city));
  const [key, Step] = STEPS[step];
  const last = step === STEPS.length - 1;
  const props: StepProps = { value, set: (patch) => setValue((v) => ({ ...v, ...patch })) };

  function finish(e: React.FormEvent) {
    e.preventDefault();
    if (!last) return setStep(step + 1);
    run(() => savePreferencesAction(value), { success: t("saved"), onSuccess: () => router.push(next) });
  }

  function skip() {
    if (edit) return router.push(next);
    run(skipOnboardingAction, { onSuccess: () => router.push(next) });
  }

  return (
    <form onSubmit={finish} className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Progress value={((step + 1) / STEPS.length) * 100} aria-label={t("progress", { step: step + 1, total: STEPS.length })} className="flex-1" />
        <span className="text-xs text-muted-foreground">{t("progress", { step: step + 1, total: STEPS.length })}</span>
        <Button type="button" variant="ghost" size="sm" disabled={pending} onClick={skip}>{edit ? t("cancel") : t("skip")}</Button>
      </div>
      <section key={key} className="page-enter">
        <h1 className="text-2xl font-semibold sm:text-3xl">{t(`${key}.title`)}</h1>
        <p className="mt-1 mb-6 text-muted-foreground">{t(`${key}.hint`)}</p>
        <Step {...props} />
      </section>
      <div className="flex justify-between gap-2 border-t pt-4">
        <Button type="button" variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}><ArrowLeft />{t("back")}</Button>
        <SubmitButton pending={pending}>{last ? <><Check />{t("finish")}</> : <>{t("next")}<ArrowRight /></>}</SubmitButton>
      </div>
    </form>
  );
}
