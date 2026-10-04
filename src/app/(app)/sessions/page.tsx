import { getTranslations } from "next-intl/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { SessionLists } from "@/features/bookings/components/session-lists";
import { listBookingsInRange, listClientBookings, listCoachBookings, nextSession } from "@/features/bookings/queries";
import { CalendarBoard } from "@/features/calendar/components/calendar-board";
import { CalendarToolbar } from "@/features/calendar/components/calendar-toolbar";
import { SlotsPanel } from "@/features/slots/components/slots-panel";
import { listSlotsInRange } from "@/features/slots/queries";
import { requireRole } from "@/lib/auth";
import { parseCalendarParams, rangeFor } from "@/lib/calendar";
import { dayKey } from "@/lib/dates";

type Search = { tab?: string; view?: string; date?: string };

export default async function SessionsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const user = await requireRole(["client", "coach"]);
  const params = await searchParams;
  const isCoach = user.role === "coach";
  const viewer = isCoach ? "coach" : "client";
  const bookings = await (isCoach ? listCoachBookings(user.id) : listClientBookings(user.id));
  const parsed = parseCalendarParams(params);
  // Without a date, open on the next session when it is after the current page (e.g. on a Sunday evening).
  const next = nextSession(bookings);
  const nextDay = next ? dayKey(next.slot.starts_at) : null;
  const date = !params.date && nextDay && nextDay > rangeFor(parsed.view, parsed.date).days.at(-1)! ? nextDay : parsed.date;
  const { view } = parsed;
  const { days, from, to } = rangeFor(view, date);
  const [t, tc, inRange, slots] = await Promise.all([
    getTranslations("sessions"), getTranslations("calendar"),
    listBookingsInRange(viewer, user.id, from, to),
    isCoach ? listSlotsInRange(user.id, from, to) : [],
  ]);
  const tab = params.tab === "list" || (isCoach && params.tab === "slots") ? params.tab : "calendar";

  return (
    <>
      <PageHeader title={t("title")} />
      <Tabs defaultValue={tab}>
        <TabsList className="mb-6 max-w-full justify-start overflow-x-auto">
          <TabsTrigger value="calendar">{tc("tab")}</TabsTrigger>
          <TabsTrigger value="list">{tc("listTab")}</TabsTrigger>
          {isCoach && <TabsTrigger value="slots">{t("tabs.slots")}</TabsTrigger>}
        </TabsList>
        <TabsContent value="calendar">
          <CalendarToolbar view={view} date={date} />
          <CalendarBoard view={view} date={date} days={days} bookings={inRange} slots={slots} viewer={viewer}
            slotDefaults={{ duration: 60, location: user.city ?? "" }} />
        </TabsContent>
        <TabsContent value="list"><SessionLists bookings={bookings} isCoach={isCoach} /></TabsContent>
        {isCoach && <TabsContent value="slots"><SlotsPanel user={user} /></TabsContent>}
      </Tabs>
    </>
  );
}
