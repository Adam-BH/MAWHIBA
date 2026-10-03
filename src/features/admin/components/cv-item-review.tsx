"use client";

import { BadgeCheck, FileText, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { verifyCvItemAction } from "@/features/admin/actions";
import { useAction } from "@/lib/use-action";

export function CvItemReview({ kind, id, title, subtitle, coach, proofUrl }: {
  kind: "achievement" | "certification";
  id: string;
  title: string;
  subtitle: string;
  coach: string;
  proofUrl: string | null;
}) {
  const t = useTranslations("admin.cvItems");
  const { pending, run } = useAction();
  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-primary">{t(kind)} · {coach}</p>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {proofUrl && <Button asChild size="sm" variant="ghost"><a href={proofUrl} target="_blank" rel="noreferrer"><FileText />{t("viewProof")}</a></Button>}
        <Button size="sm" disabled={pending} className="bg-success text-success-foreground hover:bg-success/90"
          onClick={() => run(() => verifyCvItemAction(kind, id, true), { success: t("verifiedToast") })}><BadgeCheck />{t("verify")}</Button>
        <Button size="sm" variant="outline" disabled={pending}
          onClick={() => run(() => verifyCvItemAction(kind, id, false), { success: t("rejectedToast") })}><X />{t("reject")}</Button>
      </div>
    </li>
  );
}
