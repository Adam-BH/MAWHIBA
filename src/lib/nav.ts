import type { Role } from "@/lib/auth";

// `mobile: false` items stay in the sidebar and user menu only, keeping the bottom bar ≤ 6 items.
export const NAV_ITEMS = [
  { href: "/dashboard", labelKey: "nav.dashboard", shortLabelKey: "navShort.dashboard", icon: "LayoutDashboard", roles: ["client", "coach", "admin"], mobile: true },
  { href: "/coaches", labelKey: "nav.findCoach", shortLabelKey: "navShort.findCoach", icon: "Search", roles: ["client"], mobile: true },
  { href: "/sessions", labelKey: "nav.sessions", shortLabelKey: "navShort.sessions", icon: "CalendarCheck", roles: ["client", "coach"], mobile: true },
  { href: "/requests", labelKey: "nav.myRequests", shortLabelKey: "navShort.requests", icon: "Megaphone", roles: ["client"], mobile: true },
  { href: "/slots", labelKey: "nav.slots", shortLabelKey: "navShort.slots", icon: "CalendarPlus", roles: ["coach"], mobile: true },
  { href: "/offers", labelKey: "nav.myOffers", shortLabelKey: "navShort.myOffers", icon: "Tag", roles: ["coach"], mobile: true },
  { href: "/requests", labelKey: "nav.clientRequests", shortLabelKey: "navShort.requests", icon: "Megaphone", roles: ["coach"], mobile: true },
  { href: "/learn", labelKey: "nav.learn", shortLabelKey: "navShort.learn", icon: "GraduationCap", roles: ["coach"], mobile: false },
  { href: "/payments", labelKey: "nav.payments", shortLabelKey: "navShort.payments", icon: "Receipt", roles: ["client"], mobile: false },
  { href: "/payments", labelKey: "nav.earnings", shortLabelKey: "navShort.earnings", icon: "TrendingUp", roles: ["coach"], mobile: true },
  { href: "/admin", labelKey: "nav.admin", shortLabelKey: "navShort.admin", icon: "Shield", roles: ["admin"], mobile: true },
  { href: "/admin/coaches", labelKey: "nav.verify", shortLabelKey: "navShort.verify", icon: "BadgeCheck", roles: ["admin"], mobile: true },
  { href: "/admin/bookings", labelKey: "nav.bookings", shortLabelKey: "navShort.bookings", icon: "ListChecks", roles: ["admin"], mobile: true },
  { href: "/admin/requests", labelKey: "nav.adminRequests", shortLabelKey: "navShort.requests", icon: "Megaphone", roles: ["admin"], mobile: true },
  { href: "/admin/events", labelKey: "nav.adminEvents", shortLabelKey: "navShort.adminEvents", icon: "CalendarHeart", roles: ["admin"], mobile: false },
  { href: "/admin/payments", labelKey: "nav.adminPayments", shortLabelKey: "navShort.adminPayments", icon: "Receipt", roles: ["admin"], mobile: true },
  { href: "/profile", labelKey: "nav.profile", shortLabelKey: "navShort.profile", icon: "User", roles: ["client", "coach", "admin"], mobile: false },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];

export function navItemsFor(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => (item.roles as readonly Role[]).includes(role));
}
