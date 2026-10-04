"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CITIES } from "@/lib/config";

const ALL = "all";

/** City filter and sort for the coach board; the page defaults to the coach's city when `city` is absent. */
export function BoardFilters({ city, sort }: { city: string; sort: "match" | "recent" }) {
  const t = useTranslations("requests.board");
  const tm = useTranslations("matching");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function onChange(key: "city" | "sort", value: string) {
    const next = new URLSearchParams(params);
    next.set(key, value);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <Label className="shrink-0">{t("city")}</Label>
      <Select value={city || ALL} onValueChange={(v) => onChange("city", v)}>
        <SelectTrigger className="w-48" aria-label={t("city")}><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t("allCities")}</SelectItem>
          {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={sort} onValueChange={(v) => onChange("sort", v)}>
        <SelectTrigger className="w-64" aria-label={tm("sortLabel")}><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="match">{tm("boardSortMatch")}</SelectItem>
          <SelectItem value="recent">{tm("boardSortRecent")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
