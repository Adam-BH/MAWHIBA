import { AppShell } from "@/components/layout/app-shell";
import { getBalance } from "@/features/wallet/queries";
import type { CurrentUser } from "@/lib/auth";

export async function UserShell({ user, children }: { user: CurrentUser; children: React.ReactNode }) {
  const balance = user.role === "admin" ? null : await getBalance(user.id);
  return <AppShell user={user} balance={balance}>{children}</AppShell>;
}
