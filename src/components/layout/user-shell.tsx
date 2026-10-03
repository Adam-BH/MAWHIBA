import { AppShell } from "@/components/layout/app-shell";
import { getRequestsBadgeCount } from "@/features/requests/queries";
import type { CurrentUser } from "@/lib/auth";

export async function UserShell({ user, children }: { user: CurrentUser; children: React.ReactNode }) {
  const requestsCount = user.role === "admin" ? 0 : await getRequestsBadgeCount(user.id, user.role);
  return <AppShell user={user} requestsCount={requestsCount}>{children}</AppShell>;
}
