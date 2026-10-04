"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import type { CoachFull } from "@/features/cv/queries";
import type { AthleteCardData } from "@/lib/athlete-card";
import type { LatLng } from "@/lib/geo";
import type { StrengthInput } from "@/lib/profile-strength";

export type Draft = { card?: Partial<AthleteCardData>; strength?: Partial<StrengthInput> };

export type WizardContextValue = {
  coach: CoachFull;
  pin: LatLng | null;
  step: number;
  offersCount: number;
  aiEnabled: boolean;
  setDraft: (draft: Draft) => void;
  markSaved: () => void;
  goTo: (step: number) => void;
  next: () => void;
};

export const WizardContext = createContext<WizardContextValue | null>(null);

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used inside <ProfileWizard>");
  return ctx;
}

/** Pushes the live form values of a step into the preview/strength draft. */
export function useDraftSync(draft: Draft) {
  const { setDraft } = useWizard();
  const key = JSON.stringify(draft);
  const latest = useRef(draft);
  latest.current = draft;
  useEffect(() => setDraft(latest.current), [key, setDraft]);
}
