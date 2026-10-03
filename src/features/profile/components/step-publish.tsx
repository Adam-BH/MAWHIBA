"use client";

import Link from "next/link";
import { useState } from "react";
import { Download, ExternalLink, FileText, PartyPopper, Rocket } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/shared/submit-button";
import { publishProfileAction } from "@/features/profile/actions";
import { useWizard } from "@/features/profile/components/wizard-context";
import { CV_TEMPLATES, type CvTemplate } from "@/lib/config";
import { cn } from "@/lib/utils";
import { useAction } from "@/lib/use-action";

export function StepPublish() {
  const t = useTranslations("builder.publish");
  const { coach, goTo, markSaved } = useWizard();
  const { pending, run } = useAction();
  const [template, setTemplate] = useState<CvTemplate>(coach.cv_template === "classique" ? "classique" : "moderne");
  const [isPublic, setIsPublic] = useState(coach.cv_public);
  const [celebrate, setCelebrate] = useState(false);

  function publish(e: React.FormEvent) {
    e.preventDefault();
    run(() => publishProfileAction({ cvTemplate: template, cvPublic: isPublic }), {
      onSuccess: async () => {
        markSaved();
        setCelebrate(true);
        const confetti = (await import("canvas-confetti")).default;
        confetti({ particleCount: 160, spread: 80, origin: { y: 0.7 } });
      },
    });
  }

  const links = (
    <div className="flex flex-wrap gap-2">
      <Button asChild variant="outline"><Link href={`/coaches/${coach.slug}`} target="_blank"><ExternalLink />{t("seeProfile")}</Link></Button>
      <Button asChild variant="outline"><Link href={`/cv/${coach.slug}`} target="_blank"><FileText />{t("seeCv")}</Link></Button>
      <Button asChild variant="outline"><a href={`/api/cv/${coach.slug}/pdf?template=${template}`}><Download />{t("downloadPdf")}</a></Button>
    </div>
  );

  if (celebrate) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-6 text-center animate-in zoom-in-95">
        <div className="rounded-full bg-accent/20 p-4 text-accent-foreground"><PartyPopper className="size-10" /></div>
        <h3 className="text-2xl font-semibold">{t("celebrateTitle")}</h3>
        <p className="max-w-md text-muted-foreground">{coach.verified ? t("celebrateText") : t("celebratePending")}</p>
        {links}
        <Button variant="ghost" onClick={() => goTo(1)}>{t("editAgain")}</Button>
      </div>
    );
  }

  return (
    <form onSubmit={publish} className="grid gap-5">
      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-medium">{t("template")}</legend>
        <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label={t("template")}>
          {CV_TEMPLATES.map((tpl) => (
            <button key={tpl} type="button" role="radio" aria-checked={template === tpl} onClick={() => setTemplate(tpl)}
              className={cn("flex flex-col gap-2 rounded-xl border-2 p-3 text-left transition-colors", template === tpl ? "border-primary bg-secondary" : "bg-card hover:bg-muted")}>
              <span aria-hidden className="flex h-20 gap-1 overflow-hidden rounded-md border bg-background p-1.5">
                {tpl === "moderne" && <span className="w-1/3 rounded-sm bg-primary" />}
                <span className="flex flex-1 flex-col gap-1">
                  <span className="h-2 w-2/3 rounded-sm bg-foreground/60" />
                  {[0, 1, 2, 3].map((i) => <span key={i} className="h-1.5 rounded-sm bg-muted-foreground/30" />)}
                </span>
              </span>
              <span className="font-medium">{t(`templates.${tpl}`)}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <Label className="flex items-center gap-2 font-normal">
        <Checkbox checked={isPublic} onCheckedChange={(c) => setIsPublic(c === true)} />
        {t("public")}
      </Label>
      <p className="-mt-3 text-xs text-muted-foreground">{t("publicHint")}</p>
      {links}
      <SubmitButton pending={pending} size="lg" className="h-11 justify-self-start bg-accent px-6 text-accent-foreground hover:bg-accent/90"><Rocket />{t("publish")}</SubmitButton>
    </form>
  );
}
