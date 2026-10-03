import { BadgeCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { CoachAdminRow } from "@/features/admin/components/coach-admin-row";
import { listCoachesForAdmin } from "@/features/admin/queries";
import { requireRole } from "@/lib/auth";

export default async function AdminCoachesPage() {
  await requireRole(["admin"]);
  const [t, coaches] = await Promise.all([getTranslations("admin.coaches"), listCoachesForAdmin()]);
  const queue = coaches.filter((c) => !c.verified && c.proof_path);
  const others = coaches.filter((c) => !queue.includes(c));

  return (
    <>
      <PageHeader title={t("title")} description={t("subtitle")} />
      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">{t("queue", { count: queue.length })}</h2>
        {queue.length === 0 ? <EmptyState icon={BadgeCheck} title={t("queueEmpty")} /> : (
          <ul className="divide-y rounded-xl border bg-card">{queue.map((c) => <CoachAdminRow key={c.user_id} coach={c} />)}</ul>
        )}
      </section>
      <section>
        <h2 className="mb-3 text-xl font-bold">{t("all", { count: others.length })}</h2>
        <ul className="divide-y rounded-xl border bg-card">{others.map((c) => <CoachAdminRow key={c.user_id} coach={c} />)}</ul>
      </section>
    </>
  );
}
