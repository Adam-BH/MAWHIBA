import { BadgeCheck, Medal } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { CoachAdminRow } from "@/features/admin/components/coach-admin-row";
import { CvItemReview } from "@/features/admin/components/cv-item-review";
import { listCoachesForAdmin, listPendingCvItems } from "@/features/admin/queries";
import { requireRole } from "@/lib/auth";

export default async function AdminCoachesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireRole(["admin"]);
  const [{ tab }, t, tl, coaches, items] = await Promise.all([
    searchParams, getTranslations("admin.coaches"), getTranslations("levels"), listCoachesForAdmin(), listPendingCvItems(),
  ]);
  const queue = coaches.filter((c) => !c.verified && c.proof_path);
  const others = coaches.filter((c) => !queue.includes(c));
  const pendingItems = items.achievements.length + items.certifications.length;

  return (
    <>
      <PageHeader title={t("title")} description={t("subtitle")} />
      <Tabs defaultValue={tab === "items" ? "items" : "coaches"}>
        <TabsList className="mb-4">
          <TabsTrigger value="coaches">{t("tabCoaches", { count: queue.length })}</TabsTrigger>
          <TabsTrigger value="items">{t("tabItems", { count: pendingItems })}</TabsTrigger>
        </TabsList>
        <TabsContent value="coaches">
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold">{t("queue", { count: queue.length })}</h2>
            {queue.length === 0 ? <EmptyState icon={BadgeCheck} title={t("queueEmpty")} /> : (
              <ul className="divide-y rounded-xl border bg-card">{queue.map((c) => <CoachAdminRow key={c.user_id} coach={c} />)}</ul>
            )}
          </section>
          <section>
            <h2 className="mb-3 text-xl font-semibold">{t("all", { count: others.length })}</h2>
            <ul className="divide-y rounded-xl border bg-card">{others.map((c) => <CoachAdminRow key={c.user_id} coach={c} />)}</ul>
          </section>
        </TabsContent>
        <TabsContent value="items">
          {pendingItems === 0 ? <EmptyState icon={Medal} title={t("itemsEmpty")} /> : (
            <ul className="divide-y rounded-xl border bg-card">
              {items.achievements.map((a) => (
                <CvItemReview key={a.id} kind="achievement" id={a.id} proofUrl={a.proofUrl} coach={a.coach.profile.full_name}
                  title={`${a.year} — ${a.title}${a.result ? ` · ${a.result}` : ""}`} subtitle={[a.competition, tl(a.level)].filter(Boolean).join(" · ")} />
              ))}
              {items.certifications.map((c) => (
                <CvItemReview key={c.id} kind="certification" id={c.id} proofUrl={c.proofUrl} coach={c.coach.profile.full_name}
                  title={c.title} subtitle={`${c.issuer} · ${c.year}`} />
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
