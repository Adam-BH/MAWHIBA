import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function Points({ value, className, signed = false }: { value: number; className?: string; signed?: boolean }) {
  const t = useTranslations("common");
  const sign = signed && value > 0 ? "+" : "";
  return <span className={cn("font-semibold tabular-nums", className)}>{sign}{t("points", { count: value })}</span>;
}
