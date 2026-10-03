import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function RatingStars({ rating, count, className }: { rating: number; count?: number; className?: string }) {
  const t = useTranslations("common");
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm", className)} aria-label={t("ratingLabel", { rating })}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn("size-4", i <= Math.round(rating) ? "fill-primary text-primary" : "text-border")} />
      ))}
      {count !== undefined && (
        <span className="text-muted-foreground">{count > 0 ? `${rating.toFixed(1)} (${count})` : t("noRating")}</span>
      )}
    </span>
  );
}
