import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/shared/empty-state";
import { RatingStars } from "@/components/shared/rating-stars";
import { formatDay } from "@/lib/dates";

type Review = { id: string; rating: number; comment: string | null; created_at: string; author: string };

export function ReviewList({ reviews }: { reviews: Review[] }) {
  const t = useTranslations("reviews");
  if (reviews.length === 0) return <EmptyState title={t("empty")} />;
  return (
    <ul className="flex flex-col gap-3">
      {reviews.map((r) => (
        <li key={r.id} className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium">{r.author || t("anonymous")}</span>
            <RatingStars rating={r.rating} />
          </div>
          {r.comment && <p className="mt-2 text-sm">{r.comment}</p>}
          <p className="mt-1 text-xs text-muted-foreground">{formatDay(r.created_at)}</p>
        </li>
      ))}
    </ul>
  );
}
