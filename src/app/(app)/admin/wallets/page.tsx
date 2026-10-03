import { Search } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { Points } from "@/components/shared/points";
import { StatusBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { CreditDialog } from "@/features/admin/components/credit-dialog";
import { WithdrawalActions } from "@/features/admin/components/withdrawal-actions";
import { listWithdrawals, searchUsers } from "@/features/admin/queries";
import { requireRole } from "@/lib/auth";
import { formatDateTime } from "@/lib/dates";

export default async function AdminWalletsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireRole(["admin"]);
  const { q = "" } = await searchParams;
  const [t, tr, users, withdrawals] = await Promise.all([
    getTranslations("admin.wallets"), getTranslations("roles"), searchUsers(q), listWithdrawals(),
  ]);

  return (
    <>
      <PageHeader title={t("title")} description={t("subtitle")} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="self-start">
          <CardHeader><CardTitle>{t("creditSection")}</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form className="flex gap-2" role="search">
              <Input name="q" defaultValue={q} placeholder={t("searchPlaceholder")} aria-label={t("searchPlaceholder")} />
              <Button type="submit" variant="outline" size="icon" aria-label={t("search")}><Search /></Button>
            </form>
            {q && users.length === 0 && <p className="text-sm text-muted-foreground">{t("noUsers")}</p>}
            <ul className="divide-y">
              {users.map((u) => (
                <li key={u.id} className="flex items-center gap-3 py-3">
                  <UserAvatar name={u.full_name} src={u.avatar_url} className="size-9" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{u.full_name}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.email} · {tr(u.role)} · <Points value={u.balance} /></p>
                  </div>
                  <CreditDialog userId={u.id} name={u.full_name} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="self-start">
          <CardHeader><CardTitle>{t("withdrawals")}</CardTitle></CardHeader>
          <CardContent>
            {withdrawals.length === 0 ? <p className="text-sm text-muted-foreground">{t("noWithdrawals")}</p> : (
              <ul className="divide-y">
                {withdrawals.map((w) => (
                  <li key={w.id} className="flex flex-wrap items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{w.coach.full_name} · <Points value={w.amount} /></p>
                      <p className="text-xs capitalize text-muted-foreground">{formatDateTime(w.created_at)}</p>
                    </div>
                    {w.status === "pending" ? <WithdrawalActions withdrawalId={w.id} /> : <StatusBadge status={w.status} />}
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
