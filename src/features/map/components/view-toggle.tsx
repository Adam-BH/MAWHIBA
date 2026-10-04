"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LocateFixed, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { locateMe } from "@/features/map/components/location-picker";
import { isInTunisia, roundCoord } from "@/lib/geo";
import { cn } from "@/lib/utils";

function Segmented<T extends string>({ label, options, value, onChange }: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-full border bg-card p-1">
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}
          className={cn("rounded-full px-4 py-1.5 text-sm font-medium", value === o.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Liste | Carte, "Pour vous" | "Mieux notés" (clients with preferences) and "Autour de moi". State lives in the URL; the position is rounded to ~1 km. */
export function ViewToggle({ canMatch = false }: { canMatch?: boolean }) {
  const t = useTranslations("coaches.map");
  const tm = useTranslations("matching");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [locating, setLocating] = useState(false);
  const view = params.get("view") === "map" ? "map" : "list";

  function update(key: string, value: string | null) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  function nearMe() {
    setLocating(true);
    locateMe((p) => {
      setLocating(false);
      if (!isInTunisia(p)) return toast.error(t("outside"));
      update("near", `${roundCoord(p.lat)},${roundCoord(p.lng)}`);
    }, () => {
      setLocating(false);
      toast.error(t("geoDenied"));
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canMatch && (
        <Segmented label={tm("sortLabel")} value={params.get("sort") === "rating" ? "rating" : "match"}
          options={[{ value: "match", label: tm("forYou") }, { value: "rating", label: tm("topRated") }]}
          onChange={(v) => update("sort", v === "rating" ? "rating" : null)} />
      )}
      <Segmented label={t("viewLabel")} value={view} options={[{ value: "list", label: t("list") }, { value: "map", label: t("map") }]}
        onChange={(v) => update("view", v === "map" ? "map" : null)} />
      {params.get("near") ? (
        <Button variant="secondary" size="sm" onClick={() => update("near", null)}><X />{t("clearNear")}</Button>
      ) : (
        <Button variant="outline" size="sm" disabled={locating} onClick={nearMe}><LocateFixed />{t("nearMe")}</Button>
      )}
    </div>
  );
}
