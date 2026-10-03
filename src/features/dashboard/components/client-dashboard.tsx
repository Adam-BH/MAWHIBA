import Link from "next/link";
import { CalendarCheck, CalendarClock, CalendarX, Search } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
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
      <PageHeader title={t("hello", { name: user.full_name.split(" ")[0] })} description={t("clientSubtitle")} />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={CalendarClock} label={t("upcomingCount")} value={bookings.filter((b) => isUpcoming(b.status, new Date(b.slot.starts_at))).length} />
        <StatCard icon={CalendarCheck} tone="accent" label={t("sessionsCount")} value={bookings.filter((b) => b.status === "completed").length} />
        <div className="flex flex-col gap-2">
          <Button asChild size="lg" className="min-h-11 sm:flex-1"><Link href="/coaches"><Search />{t("findCoach")}</Link></Button>
          <Button asChild size="lg" variant="outline" className="min-h-11 sm:flex-1"><Link href="/sessions"><CalendarCheck />{t("mySessions")}</Link></Button>
        </div>
      </div>
      <div className="mt-6"><ClientRequestsWidget userId={user.id} /></div>
      <section className="mt-8">
        <h2 className="mb-3 text-xl font-semibold">{t("nextSession")}</h2>
        {next ? <BookingCard booking={next} viewer="client" /> : (
          <EmptyState icon={CalendarX} title={t("noNextSession")}
            action={<Button asChild><Link href="/coaches">{t("findCoach")}</Link></Button>} />
        )}
      </section>
      {coaches.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-xl font-semibold">{t("recommended")}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coaches.map((coach) => <CoachCard key={coach.user_id} coach={coach} />)}
          </div>
        </section>
      )}
    </>
  );
}
