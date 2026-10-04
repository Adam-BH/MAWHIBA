"use client";

import Link from "next/link";
import { MapCanvas } from "@/features/map/components/map";
import type { MapMarker } from "@/features/map/components/leaflet-map";
import type { LatLng } from "@/lib/geo";

/** Static-ish preview (no zoom/drag); the whole map links to the full map view. */
export function CoachMiniMap({ label, center, zoom = 11, markers, circle, href = "/coaches?view=map" }: {
  label: string;
  center: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  circle?: LatLng & { radiusKm: number };
  href?: string;
}) {
  return (
    <div className="relative h-[280px] overflow-hidden rounded-2xl border">
      <MapCanvas ariaLabel={label} center={center} zoom={zoom} markers={markers} circle={circle} interactive={false} />
      <Link href={href} aria-label={label} className="absolute inset-0 z-[500] outline-none focus-visible:ring-3 focus-visible:ring-ring/50" />
    </div>
  );
}
