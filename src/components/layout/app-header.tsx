import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/layout/logo";
import { UserMenu } from "@/components/layout/user-menu";
import type { CurrentUser } from "@/lib/auth";

export async function AppHeader({ user }: { user: CurrentUser }) {
  const t = await getTranslations("roles");
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur md:px-8">
      <Logo href="/dashboard" className="md:hidden" />
      <Badge variant="outline" className="hidden sm:inline-flex">{t(user.role)}</Badge>
      <div className="ms-auto flex items-center gap-2">
        <UserMenu name={user.full_name} email={user.email} avatarUrl={user.avatar_url} roleLabel={t(user.role)} isCoach={user.role === "coach"} />
      </div>
    </header>
  );
}
