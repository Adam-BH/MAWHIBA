import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/** Amount in Tunisian dinars (whole DT, like every price in the DB). */
export function Price({ value, className }: { value: number; className?: string }) {
  const t = useTranslations("common");
  return <span className={cn("font-semibold tabular-nums", className)}>{t("price", { amount: value })}</span>;
}
