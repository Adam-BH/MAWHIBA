import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function BudgetRange({ min, max, className }: { min: number; max: number; className?: string }) {
  const t = useTranslations("requests");
  return <span className={cn("font-semibold tabular-nums", className)}>{t("budgetRange", { min, max })}</span>;
}
