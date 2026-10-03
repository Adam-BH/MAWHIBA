import type { Role } from "@/lib/auth";

export const NAV_ITEMS = [
  { href: "/dashboard", labelKey: "nav.dashboard", shortLabelKey: "navShort.dashboard", icon: "LayoutDashboard", roles: ["client", "coach", "admin"] },
  { href: "/coaches", labelKey: "nav.findCoach", shortLabelKey: "navShort.findCoach", icon: "Search", roles: ["client"] },
  { href: "/sessions", labelKey: "nav.sessions", shortLabelKey: "navShort.sessions", icon: "CalendarCheck", roles: ["client", "coach"] },
  { href: "/slots", labelKey: "nav.slots", shortLabelKey: "navShort.slots", icon: "CalendarPlus", roles: ["coach"] },
  { href: "/learn", labelKey: "nav.learn", shortLabelKey: "navShort.learn", icon: "GraduationCap", roles: ["coach"] },
  { href: "/wallet", labelKey: "nav.wallet", shortLabelKey: "navShort.wallet", icon: "Wallet", roles: ["client", "coach"] },
  { href: "/admin", labelKey: "nav.admin", shortLabelKey: "navShort.admin", icon: "Shield", roles: ["admin"] },
  { href: "/admin/coaches", labelKey: "nav.verify", shortLabelKey: "navShort.verify", icon: "BadgeCheck", roles: ["admin"] },
  { href: "/admin/bookings", labelKey: "nav.bookings", shortLabelKey: "navShort.bookings", icon: "ListChecks", roles: ["admin"] },
  { href: "/admin/wallets", labelKey: "nav.wallets", shortLabelKey: "navShort.wallets", icon: "Coins", roles: ["admin"] },
  { href: "/profile", labelKey: "nav.profile", shortLabelKey: "navShort.profile", icon: "User", roles: ["client", "coach", "admin"] },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];

export function navItemsFor(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => (item.roles as readonly Role[]).includes(role));
}
