"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/shared/submit-button";
import { useWizard } from "@/features/profile/components/wizard-context";

/** Précédent / Suivant, sticky above the mobile bottom nav. `submit` = the step's form saves on Suivant. */
export function StepNav({ pending = false, submit = true }: { pending?: boolean; submit?: boolean }) {
  const t = useTranslations("builder");
  const { step, goTo, next } = useWizard();
  return (
    <div className="sticky bottom-16 z-10 -mx-4 mt-2 flex justify-between gap-2 border-t bg-background px-4 py-3 md:static md:mx-0 md:border-0 md:bg-transparent md:px-0">
      <Button type="button" variant="outline" disabled={step === 1} onClick={() => goTo(step - 1)}><ArrowLeft />{t("previous")}</Button>
      {submit ? (
        <SubmitButton pending={pending}>{t("next")}<ArrowRight /></SubmitButton>
      ) : (
        <Button type="button" onClick={next}>{t("next")}<ArrowRight /></Button>
      )}
    </div>
  );
}
