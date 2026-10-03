"use client";

import Link from "next/link";
import { GraduationCap, LogOut, User } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/shared/user-avatar";
import { signOutAction } from "@/features/auth/actions";

export function UserMenu({ name, email, avatarUrl, roleLabel, isCoach }: {
  name: string;
  email: string | null;
  avatarUrl: string | null;
  roleLabel: string;
  isCoach: boolean;
}) {
  const t = useTranslations("nav");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50" aria-label={t("userMenu")}>
        <UserAvatar name={name} src={avatarUrl} className="size-8" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="truncate font-medium">{name}</p>
          <p className="truncate text-xs font-normal text-muted-foreground">{email} · {roleLabel}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link href="/profile"><User />{t("profile")}</Link></DropdownMenuItem>
        {isCoach && <DropdownMenuItem asChild><Link href="/learn"><GraduationCap />{t("learn")}</Link></DropdownMenuItem>}
        <DropdownMenuItem onSelect={() => signOutAction()}><LogOut />{t("logout")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
