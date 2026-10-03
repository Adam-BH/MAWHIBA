import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Points } from "@/components/shared/points";
import { Logo } from "@/components/layout/logo";
import { UserMenu } from "@/components/layout/user-menu";
import type { CurrentUser } from "@/lib/auth";

export async function AppHeader({ user, balance }: { user: CurrentUser; balance: number | null }) {
  const t = await getTranslations("roles");
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur md:px-8">
      <Logo href="/dashboard" className="md:hidden" />
      <Badge variant="outline" className="hidden sm:inline-flex">{t(user.role)}</Badge>
      <div className="ms-auto flex items-center gap-2">
        {balance !== null && (
          <Link href="/wallet" className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-primary hover:bg-primary/15">
            <Wallet className="size-4" />
            <Points value={balance} />
          </Link>
        )}
        <UserMenu name={user.full_name} email={user.email} avatarUrl={user.avatar_url} roleLabel={t(user.role)} isCoach={user.role === "coach"} />
      </div>
    </header>
  );
}
