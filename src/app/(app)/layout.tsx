import { UserShell } from "@/components/layout/user-shell";
import { requireUser } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <UserShell user={user}>{children}</UserShell>;
}
