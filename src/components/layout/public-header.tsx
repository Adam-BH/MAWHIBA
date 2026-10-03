import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { getCurrentUser } from "@/lib/auth";

export async function PublicHeader() {
  const [t, user] = await Promise.all([getTranslations("nav"), getCurrentUser()]);
  return (
    <header className="sticky top-0 z-30 border-b bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4">
        <Logo />
        <nav className="ms-auto flex items-center gap-1">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex"><Link href="/coaches">{t("findCoach")}</Link></Button>
          {user ? (
            <Button asChild size="sm"><Link href="/dashboard">{t("dashboard")}</Link></Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link href="/login">{t("login")}</Link></Button>
              <Button asChild size="sm"><Link href="/signup">{t("signup")}</Link></Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
