import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { CoachCard } from "@/features/coaches/components/coach-card";
import { CoachFilters } from "@/features/coaches/components/coach-filters";
import { listCoaches } from "@/features/coaches/queries";
import { CoachMapView } from "@/features/map/components/coach-map-view";
import { ViewToggle } from "@/features/map/components/view-toggle";
import { getCoachMatches, sortByMatch } from "@/features/matching/queries";
import { getMyPreferences } from "@/features/preferences/queries";
import { getCurrentUser } from "@/lib/auth";
import { parseNear } from "@/lib/validations/location";

export async function generateMetadata() {
  const t = await getTranslations("coaches");
  return { title: t("title") };
}

type Search = { sport?: string; city?: string; maxPrice?: string; inclusive?: string; near?: string; view?: string; sort?: string };

export default async function CoachesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const maxPrice = Number(params.maxPrice);
  const near = parseNear(params.near);
  const user = await getCurrentUser();
  // "Pour vous" is the default for clients who told us what they look for.
  const canMatch = user?.role === "client" && !!(await getMyPreferences(user.id))?.onboarded_at;
  const [t, listed, matches] = await Promise.all([
    getTranslations("coaches"),
    listCoaches({
      sport: params.sport,
      city: params.city,
      maxPrice: Number.isInteger(maxPrice) && maxPrice > 0 ? maxPrice : undefined,
      inclusive: params.inclusive === "1",
      near,
    }),
    canMatch && params.sort !== "rating" ? getCoachMatches(params.sport) : null,
  ]);
  const coaches = matches && !near ? sortByMatch(listed, matches) : listed;

  return (
    <>
      <PageHeader title={t("title")} actions={<Suspense><ViewToggle canMatch={canMatch} /></Suspense>} />
      <Suspense><CoachFilters /></Suspense>
      <p className="my-4 text-sm text-muted-foreground">{t("results", { count: coaches.length })}</p>
      {coaches.length === 0 ? (
        <EmptyState title={t("noResults")} />
      ) : params.view === "map" ? (
        <CoachMapView coaches={coaches} near={near} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coaches.map((coach) => <CoachCard key={coach.user_id} coach={coach} />)}
        </div>
      )}
    </>
  );
}
