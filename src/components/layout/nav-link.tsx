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
        className={cn("flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium",
          active ? "text-primary" : "text-muted-foreground")}>
        <span className="relative">
          <Icon className={cn("size-5", active && "text-accent")} />
          {count > 0 && <CountBadge count={count} className="absolute -top-1.5 -right-2.5" />}
        </span>
        <span className="w-full truncate text-center">{label}</span>
      </Link>
    );
  }
  return (
    <Link href={href} aria-current={active ? "page" : undefined}
      className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
      <Icon className="size-4" />
      {label}
      {count > 0 && <CountBadge count={count} className="ml-auto" />}
    </Link>
  );
}

function CountBadge({ count, className }: { count: number; className?: string }) {
  return (
    <span className={cn("min-w-4 rounded-full bg-accent px-1 text-center text-[10px] leading-4 font-bold text-accent-foreground", className)}>
      {count > 9 ? "9+" : count}
    </span>
  );
}
