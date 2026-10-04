"use client";

import { LocateFixed } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChipToggleGroup } from "@/components/shared/chip-toggle-group";
import { CitySelect } from "@/features/coaches/components/city-select";
import { locateMe } from "@/features/map/components/location-picker";
import { MapCanvas } from "@/features/map/components/map";
import {
  AVAILABILITY, CITIES, CITY_COORDS, GOALS, INSURANCE_FEE, LANGUAGES, MAX_PREF_GOALS, MAX_PREF_SPORTS, PREF_BUDGET,
  REQUEST_AUDIENCES, SKILL_LEVELS, SPORTS, type City,
} from "@/lib/config";
import { distanceKm, isInTunisia, roundCoord } from "@/lib/geo";
import type { PreferencesInput } from "@/lib/validations/preferences";

export type StepProps = { value: PreferencesInput; set: (patch: Partial<PreferencesInput>) => void };

/** One choice or none, with the chip look. */
function single<T extends string>(value: T | null, set: (v: T | null) => void) {
  return { value: value ? [value] : [], onChange: (v: string[]) => set((v.at(-1) as T | undefined) ?? null) };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-2"><p className="text-sm font-medium">{label}</p>{children}</div>;
}

export function StepSports({ value, set }: StepProps) {
  const t = useTranslations("onboarding.sports");
  return (
    <ChipToggleGroup ariaLabel={t("title")} options={SPORTS} max={MAX_PREF_SPORTS} value={value.sports}
      onChange={(v) => set({ sports: v as PreferencesInput["sports"] })} />
  );
}

export function StepWho({ value, set }: StepProps) {
  const t = useTranslations("onboarding.who");
  const tr = useTranslations("requests");
  return (
    <div className="grid gap-5">
      <Field label={t("audience")}>
        <ChipToggleGroup ariaLabel={t("audience")} options={[...REQUEST_AUDIENCES].reverse()} label={(a) => t(`audiences.${a as (typeof REQUEST_AUDIENCES)[number]}`)}
          {...single(value.audience, (audience) => set({ audience, childAge: audience === "enfant" ? value.childAge ?? 8 : null }))} />
      </Field>
      {value.audience === "enfant" && (
        <div className="grid max-w-40 gap-2">
          <Label htmlFor="child-age">{t("childAge")}</Label>
          <Input id="child-age" type="number" min={1} max={17} inputMode="numeric" value={value.childAge ?? ""}
            onChange={(e) => set({ childAge: e.target.value ? Math.min(17, Math.max(1, Number(e.target.value))) : null })} />
        </div>
      )}
      <Field label={t("level")}>
        <ChipToggleGroup ariaLabel={t("level")} options={SKILL_LEVELS} label={(l) => tr(`level.${l as (typeof SKILL_LEVELS)[number]}`)}
          {...single(value.level, (level) => set({ level }))} />
      </Field>
      <Label className="flex items-start gap-2 rounded-xl border bg-card p-3 font-normal">
        <Checkbox checked={value.inclusiveNeeds} onCheckedChange={(c) => set({ inclusiveNeeds: c === true })} className="mt-0.5" />
        <span><span className="font-medium">{t("inclusive")}</span><br /><span className="text-sm text-muted-foreground">{t("inclusiveHint")}</span></span>
      </Label>
      <Field label={t("languages")}>
        <ChipToggleGroup ariaLabel={t("languages")} options={LANGUAGES} value={value.languages}
          onChange={(v) => set({ languages: v as PreferencesInput["languages"] })} />
      </Field>
    </div>
  );
}

const nearestCity = (p: { lat: number; lng: number }) =>
  CITIES.reduce((best, c) => {
    const [lat, lng] = CITY_COORDS[c];
    return distanceKm(p, { lat, lng }) < distanceKm(p, { lat: CITY_COORDS[best][0], lng: CITY_COORDS[best][1] }) ? c : best;
  });

export function StepWhere({ value, set }: StepProps) {
  const t = useTranslations("onboarding.where");
  const center: [number, number] = value.point ? [value.point.lat, value.point.lng] : CITY_COORDS[value.city ?? "Tunis"];
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        <div className="min-w-40 flex-1"><CitySelect value={value.city ?? ""} onChange={(c) => set({ city: c as City, point: null })} /></div>
        <Button type="button" variant="outline" onClick={() => locateMe((p) => {
          if (!isInTunisia(p)) return toast.error(t("outside"));
          const point = { lat: roundCoord(p.lat), lng: roundCoord(p.lng) };
          set({ point, city: nearestCity(point) });
        }, () => toast.error(t("geoDenied")))}><LocateFixed />{t("useMyPosition")}</Button>
      </div>
      <div className="h-56 overflow-hidden rounded-xl border">
        <MapCanvas ariaLabel={t("mapLabel")} center={center} zoom={value.point ? 13 : 11} pin={value.point} interactive={false}
          circle={value.point ? undefined : value.city ? { lat: center[0], lng: center[1], radiusKm: 5 } : undefined} />
      </div>
      <p className="text-xs text-muted-foreground">{t("privacy")}</p>
    </div>
  );
}

export function StepBudget({ value, set }: StepProps) {
  const t = useTranslations("onboarding.budget");
  const budget = value.budgetMax ?? PREF_BUDGET.default;
  return (
    <div className="grid gap-5">
      <Field label={t("budget", { amount: budget })}>
        <input type="range" min={PREF_BUDGET.min} max={PREF_BUDGET.max} step={5} value={budget} aria-label={t("budgetLabel")}
          className="accent-primary" onChange={(e) => set({ budgetMax: Number(e.target.value) })} />
        <p className="text-xs text-muted-foreground">{t("insurance", { fee: INSURANCE_FEE })}</p>
      </Field>
      <Field label={t("availability")}>
        <ChipToggleGroup ariaLabel={t("availability")} options={AVAILABILITY} label={(a) => t(`slots.${a as (typeof AVAILABILITY)[number]}`)} value={value.availability}
          onChange={(v) => set({ availability: v as PreferencesInput["availability"] })} />
      </Field>
      <Field label={t("goals")}>
        <ChipToggleGroup ariaLabel={t("goals")} options={GOALS} max={MAX_PREF_GOALS} value={value.goals}
          onChange={(v) => set({ goals: v as PreferencesInput["goals"] })} />
      </Field>
    </div>
  );
}
