"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CITIES, SPORTS } from "@/lib/config";

const ALL = "all";

export function CoachFilters() {
  const t = useTranslations("coaches.filters");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function update(key: string, value: string | null) {
    const next = new URLSearchParams(params);
    if (value && value !== ALL) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  return (
    <div className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
      <div className="grid gap-1.5">
        <Label>{t("sport")}</Label>
        <Select value={params.get("sport") ?? ALL} onValueChange={(v) => update("sport", v)}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("allSports")}</SelectItem>
            {SPORTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label>{t("city")}</Label>
        <Select value={params.get("city") ?? ALL} onValueChange={(v) => update("city", v)}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("allCities")}</SelectItem>
            {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="maxPrice">{t("maxPrice")}</Label>
        <Input id="maxPrice" type="number" min={5} inputMode="numeric" placeholder="80"
          defaultValue={params.get("maxPrice") ?? ""} onBlur={(e) => update("maxPrice", e.target.value || null)} />
      </div>
      <Label className="flex h-9 items-center gap-2 rounded-lg border px-3">
        <Checkbox checked={params.get("inclusive") === "1"} onCheckedChange={(c) => update("inclusive", c ? "1" : null)} />
        {t("inclusive")}
      </Label>
      <Button variant="ghost" onClick={() => router.replace(pathname, { scroll: false })}>{t("reset")}</Button>
    </div>
  );
}
