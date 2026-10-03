"use client";

import { StepAchievements } from "@/features/profile/components/step-achievements";
import { StepCoaching } from "@/features/profile/components/step-coaching";
import { StepEducation } from "@/features/profile/components/step-education";
import { StepExperience } from "@/features/profile/components/step-experience";
import { StepIdentity } from "@/features/profile/components/step-identity";
import { StepPublish } from "@/features/profile/components/step-publish";
import { StepSport } from "@/features/profile/components/step-sport";

const STEPS = [StepIdentity, StepSport, StepAchievements, StepExperience, StepEducation, StepCoaching, StepPublish];

export function WizardSteps({ step }: { step: number }) {
  const Step = STEPS[step - 1] ?? StepIdentity;
  return <Step />;
}
