"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CALENDAR_VIEWS, rangeTitle, shiftDate, type CalendarView } from "@/lib/calendar";
import { dayKey } from "@/lib/dates";
import { cn } from "@/lib/utils";

/** ‹ Aujourd'hui › + title + Semaine/Mois/Agenda. All state in the URL; ←/→ and "t" from the keyboard. */
export function CalendarToolbar({ view, date }: { view: CalendarView; date: string }) {
  const t = useTranslations("calendar");
  const router = useRouter();
  const href = (v: CalendarView, d: string) => `/sessions?view=${v}&date=${d}`;
  const prev = href(view, shiftDate(view, date, -1));
  const next = href(view, shiftDate(view, date, 1));
  const today = href(view, dayKey(new Date()));

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || (e.target as HTMLElement).closest("input, textarea, select, [contenteditable], [role=dialog]")) return;
      const to = e.key === "ArrowLeft" ? prev : e.key === "ArrowRight" ? next : e.key === "t" ? today : null;
      if (to) router.push(to, { scroll: false });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, prev, next, today]);

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="icon" aria-label={t("previous")}><Link href={prev} scroll={false}><ChevronLeft /></Link></Button>
        <Button asChild variant="outline" size="sm"><Link href={today} scroll={false}>{t("today")}</Link></Button>
        <Button asChild variant="outline" size="icon" aria-label={t("next")}><Link href={next} scroll={false}><ChevronRight /></Link></Button>
        <h2 className="ms-2 text-lg font-semibold first-letter:uppercase" aria-live="polite">{rangeTitle(view, date)}</h2>
      </div>
      <div role="group" aria-label={t("viewLabel")} className="inline-flex rounded-full border bg-card p-1">
        {CALENDAR_VIEWS.map((v) => (
          <Link key={v} href={href(v, date)} scroll={false} aria-current={v === view ? "page" : undefined}
            className={cn("rounded-full px-4 py-1.5 text-sm font-medium", v === view ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>
            {t(`views.${v}`)}
          </Link>
        ))}
      </div>
    </div>
  );
}
