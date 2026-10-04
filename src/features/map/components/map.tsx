"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

/** Leaflet needs `window`: client-only, with a skeleton that fills the (fixed-height) parent. */
export const MapCanvas = dynamic(() => import("@/features/map/components/leaflet-map").then((m) => m.LeafletMap), {
  ssr: false,
  loading: () => <Skeleton className="size-full rounded-none" />,
});
