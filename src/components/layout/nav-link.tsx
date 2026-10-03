"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck, CalendarCheck, CalendarPlus, Coins, GraduationCap, LayoutDashboard,
  ListChecks, Megaphone, Search, Shield, Tag, User, Wallet, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/nav";

const ICONS: Record<NavItem["icon"], LucideIcon> = {
  LayoutDashboard, Search, CalendarCheck, CalendarPlus, GraduationCap, Wallet, Shield, BadgeCheck, ListChecks, Coins, User, Tag, Megaphone,
};

export function NavLink({ href, icon, label, variant, count = 0 }: {
  href: string;
  icon: NavItem["icon"];
  label: string;
  variant: "sidebar" | "bottom";
  count?: number;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));
  const Icon = ICONS[icon];

  if (variant === "bottom") {
    return (
      <Link href={href} aria-current={active ? "page" : undefined}
        className={cn("flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-semibold",
          active ? "text-primary" : "text-muted-foreground")}>
        <span className={cn("relative rounded-full px-4 py-1 transition-colors duration-200 ease-out", active && "bg-secondary")}>
          <Icon className="size-5" />
          {count > 0 && <CountBadge count={count} className="absolute -top-1 end-1" />}
        </span>
        <span className="w-full truncate text-center">{label}</span>
      </Link>
    );
  }
  return (
    <Link href={href} aria-current={active ? "page" : undefined}
      className={cn("flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors duration-200 ease-out",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-primary")}>
      <Icon className={cn("size-4", active && "text-accent")} />
      {label}
      {count > 0 && <CountBadge count={count} className="ms-auto" />}
    </Link>
  );
}

function CountBadge({ count, className }: { count: number; className?: string }) {
  return (
    <span className={cn("min-w-4 rounded-full bg-accent px-1 text-center text-[10px] leading-4 font-semibold text-accent-foreground ring-2 ring-card", className)}>
      {count > 9 ? "9+" : count}
    </span>
  );
}
