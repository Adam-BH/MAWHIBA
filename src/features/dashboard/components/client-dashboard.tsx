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
import { listCoaches } from "@/features/coaches/queries";
import { ClientRequestsWidget } from "@/features/requests/components/requests-widget";
import type { CurrentUser } from "@/lib/auth";
import { isUpcoming } from "@/lib/booking-rules";

export async function ClientDashboard({ user }: { user: CurrentUser }) {
  const [t, bookings, coaches] = await Promise.all([
    getTranslations("dashboard"), listClientBookings(user.id), listCoaches({ city: user.city ?? undefined }, 3),
  ]);
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coaches.map((coach) => <CoachCard key={coach.user_id} coach={coach} />)}
          </div>
        </Section>
      )}
    </>
  );
}
