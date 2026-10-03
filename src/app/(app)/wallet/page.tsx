import { Wallet } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Points } from "@/components/shared/points";
import { TopupPacks } from "@/features/wallet/components/topup-packs";
import { TxList } from "@/features/wallet/components/tx-list";
import { WithdrawForm } from "@/features/wallet/components/withdraw-form";
import { WithdrawalList } from "@/features/wallet/components/withdrawal-list";
import { getBalance, listMyWithdrawals, listTransactions } from "@/features/wallet/queries";
import { requireRole } from "@/lib/auth";

export default async function WalletPage() {
  const user = await requireRole(["client", "coach"]);
  const isCoach = user.role === "coach";
  const [t, balance, transactions, withdrawals] = await Promise.all([
    getTranslations("wallet"), getBalance(user.id), listTransactions(user.id), isCoach ? listMyWithdrawals(user.id) : [],
  ]);
  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending").reduce((sum, w) => sum + w.amount, 0);

  return (
    <>
      <PageHeader title={t("title")} description={isCoach ? t("coachSubtitle") : t("clientSubtitle")} />
      <Card className="mb-6 bg-primary text-primary-foreground">
        <CardContent className="flex items-center gap-4">
          <Wallet className="size-10 text-accent" />
          <div>
            <p className="text-sm text-primary-foreground/70">{t("balance")}</p>
            <Points value={balance} className="text-3xl" />
            {pendingWithdrawals > 0 && <p className="text-sm text-primary-foreground/70">{t("pendingWithdrawal", { amount: pendingWithdrawals })}</p>}
          </div>
        </CardContent>
      </Card>

      {isCoach ? (
        <div className="mb-8 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>{t("withdraw.title")}</CardTitle></CardHeader>
            <CardContent><WithdrawForm available={balance - pendingWithdrawals} /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>{t("withdraw.history")}</CardTitle></CardHeader>
            <CardContent><WithdrawalList withdrawals={withdrawals} /></CardContent>
          </Card>
        </div>
      ) : (
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">{t("topup.title")}</h2>
          <TopupPacks />
        </section>
      )}

      <section>
        <h2 className="mb-3 text-xl font-semibold">{isCoach ? t("earningsHistory") : t("history")}</h2>
        <TxList transactions={transactions} />
      </section>
    </>
  );
}
