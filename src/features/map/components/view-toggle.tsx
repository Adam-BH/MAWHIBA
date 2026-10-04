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

/** Liste | Carte + "Autour de moi". All state lives in the URL; the position is rounded to ~1 km. */
export function ViewToggle() {
  const t = useTranslations("coaches.map");
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
      <div role="group" aria-label={t("viewLabel")} className="inline-flex rounded-full border bg-card p-1">
        {(["list", "map"] as const).map((v) => (
          <button key={v} type="button" aria-pressed={view === v} onClick={() => update("view", v === "map" ? "map" : null)}
            className={cn("rounded-full px-4 py-1.5 text-sm font-medium", view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>
            {t(v)}
          </button>
        ))}
      </div>
      {params.get("near") ? (
        <Button variant="secondary" size="sm" onClick={() => update("near", null)}><X />{t("clearNear")}</Button>
      ) : (
        <Button variant="outline" size="sm" disabled={locating} onClick={nearMe}><LocateFixed />{t("nearMe")}</Button>
      )}
    </div>
  );
}
