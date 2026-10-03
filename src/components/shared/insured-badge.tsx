import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/** The signature lime mark: every paid session is insured by Star. */
export function InsuredBadge({ className }: { className?: string }) {
  const t = useTranslations("common");
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground", className)}>
      <Check className="size-3.5" />{t("insured")}
    </span>
  );
}
