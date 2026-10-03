import { getTranslations } from "next-intl/server";
import { navItemsFor } from "@/lib/nav";
import type { CurrentUser } from "@/lib/auth";
import { AppHeader } from "@/components/layout/app-header";
import { Logo } from "@/components/layout/logo";
import { NavLink } from "@/components/layout/nav-link";

export async function AppShell({ user, balance, requestsCount, children }: {
  user: CurrentUser;
  balance: number | null;
  requestsCount: number;
  children: React.ReactNode;
}) {
  const t = await getTranslations();
  const items = navItemsFor(user.role).map((item) => ({
    ...item,
    label: t(item.labelKey),
    shortLabel: t(item.shortLabelKey),
    count: item.href === "/requests" ? requestsCount : 0,
  }));

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-6 border-e bg-card p-4 md:flex">
        <Logo href="/dashboard" className="px-3 pt-1" />
        <nav className="flex flex-col gap-1">
          {items.map((item) => <NavLink key={item.href} {...item} variant="sidebar" />)}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-col">
        <AppHeader user={user} balance={balance} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-24 md:px-8 md:pt-8 md:pb-10">{children}</main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {items.filter((item) => item.mobile).map((item) => <NavLink key={item.href} {...item} label={item.shortLabel} variant="bottom" />)}
      </nav>
    </div>
  );
}
