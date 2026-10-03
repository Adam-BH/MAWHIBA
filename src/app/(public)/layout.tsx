import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/layout/logo";
import { PublicHeader } from "@/components/layout/public-header";
import { UserShell } from "@/components/layout/user-shell";
import { getCurrentUser } from "@/lib/auth";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (user) return <UserShell user={user}>{children}</UserShell>;
  const t = await getTranslations("landing");
  return (
    <div className="flex min-h-dvh flex-col">
      <PublicHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:py-10">{children}</main>
      <footer className="mt-10 rounded-t-4xl bg-primary px-4 py-10 text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Logo tone="onPrimary" className="h-12" />
          <p className="text-sm text-primary-foreground/80">{t("footer")}</p>
        </div>
      </footer>
    </div>
  );
}
