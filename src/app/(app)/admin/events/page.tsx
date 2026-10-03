import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { EventForm } from "@/features/events/components/event-form";
import { listEvents } from "@/features/events/queries";
import { requireRole } from "@/lib/auth";
import { formatDateTime } from "@/lib/dates";

export default async function AdminEventsPage() {
  await requireRole(["admin"]);
  const [t, events] = await Promise.all([getTranslations("events"), listEvents()]);
  return (
    <>
      <PageHeader title={t("adminTitle")} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="self-start">
          <CardHeader><CardTitle>{t("form.heading")}</CardTitle></CardHeader>
          <CardContent><EventForm /></CardContent>
        </Card>
        <Card className="self-start">
          <CardHeader><CardTitle>{t("listHeading")}</CardTitle></CardHeader>
          <CardContent>
            {events.length === 0 ? <p className="text-sm text-muted-foreground">{t("empty")}</p> : (
              <ul className="divide-y">
                {events.map((e) => (
                  <li key={e.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                    <div className="min-w-48 flex-1">
                      <p className="truncate font-medium">{e.title}</p>
                      <p className="text-xs capitalize text-muted-foreground">{formatDateTime(e.starts_at)} · {e.location}</p>
                    </div>
                    <span className="text-sm tabular-nums">{t("registeredCount", { count: e.registered, capacity: e.capacity })}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
