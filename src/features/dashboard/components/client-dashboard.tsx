import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { Stat } from "@/components/shared/stat";
import { BookingCard } from "@/features/bookings/components/booking-card";
import { listClientBookings, nextSession } from "@/features/bookings/queries";
import { CoachCard } from "@/features/coaches/components/coach-card";
import { listCoachPins, listCoaches } from "@/features/coaches/queries";
import { CoachMiniMap } from "@/features/map/components/coach-mini-map";
import { ClientRequestsWidget } from "@/features/requests/components/requests-widget";
import type { CurrentUser } from "@/lib/auth";
import { isUpcoming } from "@/lib/booking-rules";
import { CITY_COORDS, MAP_DEFAULT_CENTER, type City } from "@/lib/config";

export async function ClientDashboard({ user }: { user: CurrentUser }) {
  const [t, bookings, coaches, pins] = await Promise.all([
    getTranslations("dashboard"), listClientBookings(user.id), listCoaches({ city: user.city ?? undefined }, 3), listCoachPins(),
  ]);
  const center = CITY_COORDS[user.city as City] ?? MAP_DEFAULT_CENTER;
  const next = nextSession(bookings);

  return (
    <>
      <PageHeader title={t("title")} actions={<Button asChild size="lg"><Link href="/coaches">{t("findCoach")}</Link></Button>} />
      <div className="grid gap-6 sm:grid-cols-2">
        <Stat label={t("upcomingCount")} value={bookings.filter((b) => isUpcoming(b.status, new Date(b.slot.starts_at))).length} />
        <Stat label={t("sessionsCount")} value={bookings.filter((b) => b.status === "completed").length} />
      </div>
      <Section title={t("nextSession")}>
        {next ? <BookingCard booking={next} viewer="client" /> : <EmptyState title={t("noNextSession")} />}
      </Section>
      <ClientRequestsWidget userId={user.id} />
      {coaches.length > 0 && (
        <Section title={t("recommended")}>
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <div className="grid gap-4 sm:grid-cols-2">
              {coaches.map((coach) => <CoachCard key={coach.user_id} coach={coach} />)}
            </div>
            <CoachMiniMap label={t("openMap")} center={center} markers={pins} />
          </div>
        </Section>
      )}
    </>
  );
}
