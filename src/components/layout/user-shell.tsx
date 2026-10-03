import { AppShell } from "@/components/layout/app-shell";
import { getRequestsBadgeCount } from "@/features/requests/queries";
import { getBalance } from "@/features/wallet/queries";
import type { CurrentUser } from "@/lib/auth";

export async function UserShell({ user, children }: { user: CurrentUser; children: React.ReactNode }) {
  const isAdmin = user.role === "admin";
  const [balance, requestsCount] = await Promise.all([
    isAdmin ? null : getBalance(user.id),
    isAdmin ? 0 : getRequestsBadgeCount(user.id, user.role),
  ]);
  return <AppShell user={user} balance={balance} requestsCount={requestsCount}>{children}</AppShell>;
}
