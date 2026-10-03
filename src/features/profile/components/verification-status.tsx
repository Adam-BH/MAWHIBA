import { BadgeCheck, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { FileUpload } from "@/features/coaches/components/file-upload";
import { uploadItemProofAction } from "@/features/profile/item-actions";

/** "Vérifié" / "En attente de vérification" / upload a proof. */
export function VerificationStatus({ kind, id, verified, hasProof }: {
  kind: "achievement" | "certification";
  id: string;
  verified: boolean;
  hasProof: boolean;
}) {
  const t = useTranslations("builder.proof");
  if (verified) return <span className="flex items-center gap-1 text-xs font-semibold text-success"><BadgeCheck className="size-3.5" />{t("verified")}</span>;
  if (hasProof) return <span className="flex items-center gap-1 text-xs text-warning-foreground"><Clock className="size-3.5" />{t("pending")}</span>;
  return (
    <FileUpload action={uploadItemProofAction} fields={{ kind, id }} accept="image/png,image/jpeg,image/webp,application/pdf"
      label={t("upload")} success={t("uploaded")} size="sm" variant="ghost" />
  );
}
