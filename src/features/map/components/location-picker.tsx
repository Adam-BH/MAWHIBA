"use client";

import { useState } from "react";
import { LocateFixed, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CitySelect } from "@/features/coaches/components/city-select";
import { MapCanvas } from "@/features/map/components/map";
import { CITY_COORDS, MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, type City } from "@/lib/config";
import { isInTunisia, type LatLng } from "@/lib/geo";
import type { LocationInput } from "@/lib/validations/location";

/** Browser position, for this request only (never stored as is). */
export function locateMe(onFound: (p: LatLng) => void, onFail: () => void) {
  if (!navigator.geolocation) return onFail();
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => onFound({ lat: coords.latitude, lng: coords.longitude }),
    onFail,
    { enableHighAccuracy: false, timeout: 10_000 },
  );
}

export function LocationPicker({ value, onChange }: { value: LocationInput; onChange: (value: LocationInput) => void }) {
  const t = useTranslations("map.picker");
  const [city, setCity] = useState("");
  const [center, setCenter] = useState<[number, number]>(value.point ? [value.point.lat, value.point.lng] : MAP_DEFAULT_CENTER);

  function place(point: LatLng) {
    if (!isInTunisia(point)) return toast.error(t("outside"));
    onChange({ ...value, point });
    setCenter([point.lat, point.lng]);
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        <div className="min-w-40 flex-1">
          <CitySelect value={city} onChange={(c) => {
            setCity(c);
            const [lat, lng] = CITY_COORDS[c as City];
            place({ lat, lng });
          }} />
        </div>
        <Button type="button" variant="outline" onClick={() => locateMe(place, () => toast.error(t("geoDenied")))}>
          <LocateFixed />{t("useMyPosition")}
        </Button>
        {value.point && (
          <Button type="button" variant="ghost" onClick={() => onChange({ ...value, point: null })}><X />{t("remove")}</Button>
        )}
      </div>
      <div className="h-72 overflow-hidden rounded-xl border">
        <MapCanvas ariaLabel={t("mapLabel")} center={center} zoom={value.point ? 13 : MAP_DEFAULT_ZOOM}
          pin={value.point} onPinChange={place}
          circle={value.point ? { ...value.point, radiusKm: value.radiusKm } : undefined} />
      </div>
      <p className="text-xs text-muted-foreground">{value.point ? t("privacy") : t("hint")}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="base-label">{t("label")}</Label>
          <Input id="base-label" maxLength={80} placeholder={t("labelPlaceholder")} value={value.label}
            onChange={(e) => onChange({ ...value, label: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="radius">{t("radius", { km: value.radiusKm })}</Label>
          <input id="radius" type="range" min={1} max={50} value={value.radiusKm} className="accent-primary"
            onChange={(e) => onChange({ ...value, radiusKm: Number(e.target.value) })} />
        </div>
      </div>
    </div>
  );
}
