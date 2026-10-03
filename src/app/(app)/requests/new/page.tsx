import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/page-header";
import { RequestForm } from "@/features/requests/components/request-form";
import { requireRole } from "@/lib/auth";
import { CITIES, type Sport } from "@/lib/config";

export default async function NewRequestPage() {
  const user = await requireRole(["client"]);
  const t = await getTranslations("requests");
  const city = CITIES.find((c) => c === user.city) ?? CITIES[0];
  return (
    <>
      <PageHeader title={t("newTitle")} description={t("newSubtitle")} />
      <RequestForm firstName={user.full_name.split(" ")[0]} defaults={{
        sport: "Natation" as Sport, city, title: "", description: "", audience: "enfant", childAge: 8, level: "debutant",
        specialNeeds: false, specialNeedsNote: "", scheduleNote: "", budget: { min: 30, max: 50 },
      }} />
    </>
  );
}
