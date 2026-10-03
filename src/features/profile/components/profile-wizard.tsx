"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AthleteCard } from "@/components/shared/athlete-card";
import { reachStepAction } from "@/features/profile/actions";
import { StrengthMeter } from "@/features/profile/components/strength-meter";
import { WizardContext, type Draft } from "@/features/profile/components/wizard-context";
import { WizardSteps } from "@/features/profile/components/wizard-steps";
import type { CoachFull } from "@/features/cv/queries";
import { athleteCardData } from "@/lib/athlete-card";
import { PROFILE_STEPS } from "@/lib/config";
import { profileStrength, STRENGTH_COMPLETE_FROM, type StrengthInput } from "@/lib/profile-strength";
import { cn } from "@/lib/utils";

const STEP_NAMES = ["identity", "sport", "achievements", "experience", "education", "coaching", "publish"] as const;

export function ProfileWizard({ coach, step, offersCount, aiEnabled, strengthBase }: {
  coach: CoachFull;
  step: number;
  offersCount: number;
  aiEnabled: boolean;
  strengthBase: StrengthInput;
}) {
  const t = useTranslations("builder");
  const router = useRouter();
  const [draft, setDraftState] = useState<Draft>({});
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const strength = profileStrength({ ...strengthBase, ...draft.strength });
  const card = { ...athleteCardData(coach, strength.score, STRENGTH_COMPLETE_FROM), ...draft.card };

  const goTo = useCallback((n: number) => {
    setDraftState({});
    router.push(`/profile?step=${n}`);
  }, [router]);

  const ctx = useMemo(() => ({
    coach, step, offersCount, aiEnabled,
    setDraft: setDraftState,
    markSaved: () => setSavedAt(Date.now()),
    goTo,
    next: () => {
      const n = Math.min(step + 1, PROFILE_STEPS);
      void reachStepAction(n);
      goTo(n);
    },
  }), [coach, step, offersCount, aiEnabled, goTo]);

  const preview = <AthleteCard card={card} />;

  return (
    <WizardContext.Provider value={ctx}>
      <div className="flex flex-col gap-4">
        <nav aria-label={t("stepsLabel")} className="-mx-4 overflow-x-auto px-4">
          <ol className="flex min-w-max gap-1">
            {Array.from({ length: PROFILE_STEPS }, (_, i) => i + 1).map((n) => (
              <li key={n}>
                <button type="button" onClick={() => goTo(n)} aria-current={n === step ? "step" : undefined}
                  className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    n === step ? "bg-primary text-primary-foreground" : n < coach.builder_step ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-muted")}>
                  <span className="flex size-5 items-center justify-center rounded-full bg-background/20 text-[11px]">
                    {n < coach.builder_step && n !== step ? <Check className="size-3" /> : n}
                  </span>
                  {t(`steps.${STEP_NAMES[n - 1]}`)}
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center">
          <StrengthMeter {...strength} className="flex-1" />
          <span className={cn("text-xs text-success transition-opacity", savedAt ? "opacity-100" : "opacity-0")} aria-live="polite">
            {t("savedIndicator")}
          </span>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <section key={step} className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="mb-1 text-xl font-bold">{t(`steps.${STEP_NAMES[step - 1]}`)}</h2>
            <p className="mb-4 text-sm text-muted-foreground">{t(`stepHints.${STEP_NAMES[step - 1]}`)}</p>
            <WizardSteps step={step} />
          </section>
          <aside className="hidden lg:sticky lg:top-20 lg:block lg:self-start">
            <p className="mb-2 text-sm font-medium text-muted-foreground">{t("preview")}</p>
            {preview}
          </aside>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="secondary" size="sm" className="fixed right-4 bottom-20 z-30 shadow-lg lg:hidden"><Eye />{t("preview")}</Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto rounded-t-2xl px-4 pb-6">
            <SheetHeader className="px-0"><SheetTitle>{t("preview")}</SheetTitle></SheetHeader>
            {preview}
          </SheetContent>
        </Sheet>
      </div>
    </WizardContext.Provider>
  );
}
