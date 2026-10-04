import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingList } from "@/features/bookings/components/booking-list";
import type { BookingRow } from "@/features/bookings/queries";
import { isUpcoming } from "@/lib/booking-rules";

/** The list view of /sessions: coach requests, upcoming, past. */
export async function SessionLists({ bookings, isCoach }: { bookings: BookingRow[]; isCoach: boolean }) {
  const t = await getTranslations("sessions");
  const now = new Date();
  const requests = isCoach ? bookings.filter((b) => b.status === "pending").reverse() : [];
  const upcoming = bookings
    .filter((b) => isUpcoming(b.status, new Date(b.slot.starts_at), now) && !(isCoach && b.status === "pending"))
    .reverse();
  const past = bookings.filter((b) => !requests.includes(b) && !upcoming.includes(b));
  const viewer = isCoach ? "coach" : "client";
  const findCoach = <Button asChild><Link href="/coaches">{t("findCoach")}</Link></Button>;

  return (
    <Tabs defaultValue={isCoach && requests.length ? "requests" : "upcoming"}>
      <TabsList className="mb-6 max-w-full justify-start overflow-x-auto">
        {isCoach && <TabsTrigger value="requests">{t("tabs.requests", { count: requests.length })}</TabsTrigger>}
        <TabsTrigger value="upcoming">{t("tabs.upcoming")}</TabsTrigger>
        <TabsTrigger value="past">{t("tabs.past")}</TabsTrigger>
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
    </Tabs>
  );
}
