import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { CoachCard } from "@/features/coaches/components/coach-card";
import { CoachFilters } from "@/features/coaches/components/coach-filters";
import { listCoaches } from "@/features/coaches/queries";

export async function generateMetadata() {
  const t = await getTranslations("coaches");
  return { title: t("title") };
}

type Search = { sport?: string; city?: string; maxPrice?: string; inclusive?: string };

export default async function CoachesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const maxPrice = Number(params.maxPrice);
  const [t, coaches] = await Promise.all([
    getTranslations("coaches"),
    listCoaches({
      sport: params.sport,
      city: params.city,
      maxPrice: Number.isInteger(maxPrice) && maxPrice > 0 ? maxPrice : undefined,
      inclusive: params.inclusive === "1",
    }),
  ]);

  return (
    <>
      <PageHeader title={t("title")} />
      <Suspense><CoachFilters /></Suspense>
      <p className="my-4 text-sm text-muted-foreground">{t("results", { count: coaches.length })}</p>
      {coaches.length === 0 ? (
        <EmptyState title={t("noResults")} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coaches.map((coach) => <CoachCard key={coach.user_id} coach={coach} />)}
        </div>
      )}
    </>
  );
}
