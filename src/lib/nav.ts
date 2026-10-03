import type { Role } from "@/lib/auth";

/**
 * `main`: sidebar and mobile bottom bar (max 5 per role). `menu`: the user dropdown.
 * `hidden`: reachable by URL only; set it back to `main` or `menu` to re-enable.
 */
export const NAV_ITEMS = [
  { href: "/dashboard", labelKey: "nav.dashboard", shortLabelKey: "navShort.dashboard", icon: "LayoutDashboard", roles: ["client", "coach"], place: "main" },
  { href: "/coaches", labelKey: "nav.findCoach", shortLabelKey: "navShort.findCoach", icon: "Search", roles: ["client"], place: "main" },
  { href: "/sessions", labelKey: "nav.sessions", shortLabelKey: "navShort.sessions", icon: "CalendarCheck", roles: ["client", "coach"], place: "main" },
  { href: "/requests", labelKey: "nav.myRequests", shortLabelKey: "navShort.requests", icon: "Megaphone", roles: ["client"], place: "main" },
  { href: "/offers", labelKey: "nav.myOffers", shortLabelKey: "navShort.myOffers", icon: "Tag", roles: ["coach"], place: "main" },
  { href: "/requests", labelKey: "nav.clientRequests", shortLabelKey: "navShort.requests", icon: "Megaphone", roles: ["coach"], place: "main" },
  { href: "/learn", labelKey: "nav.learn", shortLabelKey: "navShort.learn", icon: "GraduationCap", roles: ["coach"], place: "main" },
  { href: "/admin", labelKey: "nav.admin", shortLabelKey: "navShort.admin", icon: "LayoutDashboard", roles: ["admin"], place: "main" },
  { href: "/admin/coaches", labelKey: "nav.verify", shortLabelKey: "navShort.verify", icon: "BadgeCheck", roles: ["admin"], place: "main" },
  { href: "/admin/bookings", labelKey: "nav.bookings", shortLabelKey: "navShort.bookings", icon: "ListChecks", roles: ["admin"], place: "main" },
  { href: "/admin/payments", labelKey: "nav.adminPayments", shortLabelKey: "navShort.adminPayments", icon: "Receipt", roles: ["admin"], place: "main" },
  { href: "/payments", labelKey: "nav.payments", shortLabelKey: "navShort.payments", icon: "Receipt", roles: ["client"], place: "menu" },
  { href: "/payments", labelKey: "nav.earnings", shortLabelKey: "navShort.earnings", icon: "TrendingUp", roles: ["coach"], place: "menu" },
  { href: "/profile", labelKey: "nav.profile", shortLabelKey: "navShort.profile", icon: "User", roles: ["client", "coach", "admin"], place: "menu" },
  { href: "/admin/requests", labelKey: "nav.adminRequests", shortLabelKey: "navShort.requests", icon: "Megaphone", roles: ["admin"], place: "hidden" },
  { href: "/admin/events", labelKey: "nav.adminEvents", shortLabelKey: "navShort.adminEvents", icon: "CalendarHeart", roles: ["admin"], place: "hidden" },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];

export function navItemsFor(role: Role, place: NavItem["place"]): NavItem[] {
  return NAV_ITEMS.filter((item) => item.place === place && (item.roles as readonly Role[]).includes(role));
}
