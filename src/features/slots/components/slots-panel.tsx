import { getTranslations } from "next-intl/server";
import { addDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMyCoachProfile } from "@/features/coaches/queries";
import { SlotForm } from "@/features/slots/components/slot-form";
import { SlotList } from "@/features/slots/components/slot-list";
import { listMyUpcomingSlots } from "@/features/slots/queries";
import type { CurrentUser } from "@/lib/auth";
import { dayKey } from "@/lib/dates";

export async function SlotsPanel({ user }: { user: CurrentUser }) {
  const [t, coach, slots] = await Promise.all([getTranslations("slots"), getMyCoachProfile(user.id), listMyUpcomingSlots(user.id)]);
  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Card className="self-start">
        <CardHeader><CardTitle>{t("new")}</CardTitle></CardHeader>
        <CardContent>
          <SlotForm defaults={{
            date: dayKey(addDays(new Date(), 1)),
            time: "18:00",
            duration: coach?.session_duration_min ?? 60,
            location: user.city ?? "",
            weekly: false,
          }} />
        </CardContent>
      </Card>
      <section>
        <h2 className="mb-3 text-xl font-semibold">{t("upcoming", { count: slots.length })}</h2>
        <SlotList slots={slots} />
      </section>
    </div>
  );
}
