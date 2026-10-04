"use client";

import Link from "next/link";
import { useState } from "react";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Price } from "@/components/shared/price";
import { CoachCard } from "@/features/coaches/components/coach-card";
import type { CoachCardData } from "@/features/coaches/queries";
import { MapCanvas } from "@/features/map/components/map";
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from "@/lib/config";
import type { LatLng } from "@/lib/geo";
import { cn, initials } from "@/lib/utils";

function Popup({ coach }: { coach: CoachCardData }) {
  const t = useTranslations("coaches");
  return (
    <div className="grid min-w-44 gap-1 text-sm">
      <p className="font-display font-semibold">{coach.profile.full_name}</p>
      <p className="text-muted-foreground">{coach.primary_sport ?? coach.sports[0]}{coach.base_label ? ` · ${coach.base_label}` : ""}</p>
      <p className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1">
          {coach.stats.ratingCount > 0 ? <><Star className="size-3.5 fill-primary text-primary" />{coach.stats.ratingAvg.toFixed(1)}</> : t("new")}
        </span>
        <span>{t("from")} <Price value={coach.price_per_session} /></span>
      </p>
      <Link href={`/coaches/${coach.slug ?? coach.user_id}`} className="font-semibold text-primary hover:underline">{t("map.seeProfile")}</Link>
    </div>
  );
}

/** Desktop: list 2/5 + sticky map 3/5. Mobile: full-width map over a horizontal card carousel. */
export function CoachMapView({ coaches, near }: { coaches: CoachCardData[]; near?: LatLng }) {
  const t = useTranslations("coaches.map");
  const [activeId, setActiveId] = useState<string | null>(null);
  const pinned = coaches.filter((c) => c.map_lat !== null && c.map_lng !== null);
  const unpinned = coaches.filter((c) => c.map_lat === null || c.map_lng === null);
  const markers = pinned.map((c) => ({
    id: c.user_id, lat: c.map_lat ?? 0, lng: c.map_lng ?? 0, initials: initials(c.profile.full_name), popup: <Popup coach={c} />,
  }));

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="h-[60vh] overflow-hidden rounded-2xl border lg:sticky lg:top-20 lg:order-2 lg:col-span-3 lg:h-[calc(100dvh-7rem)]">
          <MapCanvas ariaLabel={t("mapLabel")} center={near ? [near.lat, near.lng] : MAP_DEFAULT_CENTER}
            zoom={near ? 12 : MAP_DEFAULT_ZOOM} fit={!near} markers={markers} pin={near} activeId={activeId} onActiveChange={setActiveId} />
        </div>
        <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 lg:col-span-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
          {pinned.map((c) => (
            <li key={c.user_id} className={cn("w-72 shrink-0 snap-start rounded-3xl lg:w-auto", activeId === c.user_id && "ring-2 ring-primary")}
              onMouseEnter={() => setActiveId(c.user_id)} onMouseLeave={() => setActiveId(null)}
              onFocus={() => setActiveId(c.user_id)} onBlur={() => setActiveId(null)}>
              <CoachCard coach={c} />
            </li>
          ))}
        </ul>
      </div>
      {unpinned.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">{t("noPin")}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {unpinned.map((c) => <CoachCard key={c.user_id} coach={c} />)}
          </div>
        </section>
      )}
    </div>
  );
}
