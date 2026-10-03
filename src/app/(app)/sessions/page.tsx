import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { BookingList } from "@/features/bookings/components/booking-list";
import { SlotsPanel } from "@/features/slots/components/slots-panel";
import { listClientBookings, listCoachBookings } from "@/features/bookings/queries";
import { requireRole } from "@/lib/auth";
import { isUpcoming } from "@/lib/booking-rules";

export default async function SessionsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await requireRole(["client", "coach"]);
  const { tab } = await searchParams;
  const isCoach = user.role === "coach";
  const [t, bookings] = await Promise.all([
    getTranslations("sessions"),
    isCoach ? listCoachBookings(user.id) : listClientBookings(user.id),
  ]);
  const now = new Date();
  const requests = isCoach ? bookings.filter((b) => b.status === "pending").reverse() : [];
  const upcoming = bookings
    .filter((b) => isUpcoming(b.status, new Date(b.slot.starts_at), now) && !(isCoach && b.status === "pending"))
    .reverse();
  const past = bookings.filter((b) => !requests.includes(b) && !upcoming.includes(b));
  const viewer = isCoach ? "coach" : "client";
  const findCoach = <Button asChild><Link href="/coaches">{t("findCoach")}</Link></Button>;

  return (
    <>
      <PageHeader title={t("title")} />
      <Tabs defaultValue={isCoach && tab === "slots" ? "slots" : isCoach && requests.length ? "requests" : "upcoming"}>
        <TabsList className="mb-6 max-w-full justify-start overflow-x-auto">
          {isCoach && <TabsTrigger value="requests">{t("tabs.requests", { count: requests.length })}</TabsTrigger>}
          <TabsTrigger value="upcoming">{t("tabs.upcoming")}</TabsTrigger>
          <TabsTrigger value="past">{t("tabs.past")}</TabsTrigger>
          {isCoach && <TabsTrigger value="slots">{t("tabs.slots")}</TabsTrigger>}
        </TabsList>
        {isCoach && (
          <TabsContent value="requests">
            <BookingList bookings={requests} viewer={viewer} emptyTitle={t("empty.requests")} />
          </TabsContent>
        )}
        <TabsContent value="upcoming">
          <BookingList bookings={upcoming} viewer={viewer} emptyTitle={t("empty.upcoming")} emptyAction={isCoach ? undefined : findCoach} />
        </TabsContent>
        <TabsContent value="past">
          <BookingList bookings={past} viewer={viewer} emptyTitle={t("empty.past")} />
        </TabsContent>
        {isCoach && <TabsContent value="slots"><SlotsPanel user={user} /></TabsContent>}
      </Tabs>
    </>
  );
}
