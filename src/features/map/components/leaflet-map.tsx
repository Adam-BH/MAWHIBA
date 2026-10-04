"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, type ReactNode } from "react";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { MAP_ATTRIBUTION, MAP_TILE_URL } from "@/lib/config";
import type { LatLng } from "@/lib/geo";

export type MapMarker = { id: string; lat: number; lng: number; initials: string; popup?: ReactNode };

export type LeafletMapProps = {
  ariaLabel: string;
  center: [number, number];
  zoom: number;
  markers?: MapMarker[];
  /** Fit the view to the markers whenever they change. */
  fit?: boolean;
  activeId?: string | null;
  onActiveChange?: (id: string | null) => void;
  /** Draggable pin; clicking the map moves it there. */
  pin?: LatLng | null;
  onPinChange?: (point: LatLng) => void;
  circle?: LatLng & { radiusKm: number };
  interactive?: boolean;
};

// Token classes only: the marker is plain HTML, styled like the rest of the app.
const markerIcon = (initials: string, active: boolean) => L.divIcon({
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
  html: `<span class="flex size-9 items-center justify-center rounded-full border-2 border-card text-xs font-semibold shadow-md ${
    active ? "bg-accent text-accent-foreground scale-110" : "bg-primary text-primary-foreground"}">${initials}</span>`,
});

const pinIcon = L.divIcon({
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  html: `<span class="block size-7 rounded-full rounded-br-none rotate-45 border-2 border-card bg-primary shadow-md"></span>`,
});

function Recenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  const [lat, lng] = center;
  useEffect(() => { map.setView([lat, lng], zoom); }, [map, lat, lng, zoom]);
  return null;
}

function FitMarkers({ markers }: { markers: MapMarker[] }) {
  const map = useMap();
  const key = markers.map((m) => m.id).join();
  useEffect(() => {
    if (markers.length > 1) map.fitBounds(markers.map((m) => [m.lat, m.lng] as [number, number]), { padding: [40, 40], maxZoom: 13 });
    else if (markers.length === 1) map.setView([markers[0].lat, markers[0].lng], 13);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refit only when the set of markers changes
  }, [map, key]);
  return null;
}

function ClickToPlace({ onPick }: { onPick: (point: LatLng) => void }) {
  useMapEvents({ click: (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

export function LeafletMap({
  ariaLabel, center, zoom, markers = [], fit = false, activeId, onActiveChange, pin, onPinChange, circle, interactive = true,
}: LeafletMapProps) {
  const icons = useMemo(
    () => new Map(markers.map((m) => [m.id, markerIcon(m.initials, m.id === activeId)])),
    [markers, activeId],
  );
  return (
    <MapContainer center={center} zoom={zoom} className="size-full" aria-label={ariaLabel}
      scrollWheelZoom={interactive} dragging={interactive} zoomControl={interactive} doubleClickZoom={interactive}
      touchZoom={interactive} keyboard={interactive} attributionControl>
      <TileLayer url={MAP_TILE_URL} attribution={MAP_ATTRIBUTION} />
      {fit ? <FitMarkers markers={markers} /> : <Recenter center={center} zoom={zoom} />}
      {circle && <Circle center={[circle.lat, circle.lng]} radius={circle.radiusKm * 1000} pathOptions={{ className: "map-area" }} />}
      {onPinChange && <ClickToPlace onPick={onPinChange} />}
      {pin && (
        <Marker position={[pin.lat, pin.lng]} icon={pinIcon} draggable={!!onPinChange}
          eventHandlers={{ dragend: (e) => onPinChange?.((e.target as L.Marker).getLatLng()) }} />
      )}
      {markers.map((m) => (
        <Marker key={m.id} position={[m.lat, m.lng]} icon={icons.get(m.id)} zIndexOffset={m.id === activeId ? 1000 : 0}
          eventHandlers={{ mouseover: () => onActiveChange?.(m.id), mouseout: () => onActiveChange?.(null) }}>
          {m.popup && <Popup>{m.popup}</Popup>}
        </Marker>
      ))}
    </MapContainer>
  );
}
