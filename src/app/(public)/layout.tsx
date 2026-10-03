import { getTranslations } from "next-intl/server";
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
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">{t("footer")}</footer>
    </div>
  );
}
