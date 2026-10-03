"use client";

import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CITIES } from "@/lib/config";

export function CitySelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const t = useTranslations("profile");
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger className="w-full"><SelectValue placeholder={t("chooseCity")} /></SelectTrigger>
      <SelectContent>
        {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
