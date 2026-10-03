import { ACHIEVEMENT_LEVELS, ATHLETE_STATUSES, CITIES, CV_TEMPLATES, LANGUAGES, SPORTS } from "@/lib/config";
import { SLUG_PATTERN } from "@/lib/slug";
import { z } from "@/lib/validations/zod";

const year = z.number().int().min(1950).max(2100);
const optionalYears = z.number().int().min(0).max(80).optional();

/** YouTube or Instagram links only, https. */
export const VIDEO_URL_PATTERN = /^https:\/\/(www\.|m\.)?(youtube\.com\/(watch\?v=|shorts\/)[\w-]{6,}|youtu\.be\/[\w-]{6,}|instagram\.com\/(p|reel|tv)\/[\w-]+)/;
/** Handles only: letters, digits, dot, underscore, dash; optional leading @. */
export const HANDLE_PATTERN = /^@?[a-zA-Z0-9._-]{2,40}$/;

export const videoUrlSchema = z.string().trim().regex(VIDEO_URL_PATTERN).or(z.literal(""));
export const handleSchema = z.string().trim().regex(HANDLE_PATTERN).or(z.literal(""));

export const identitySchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  city: z.enum(CITIES).or(z.literal("")),
  tagline: z.string().trim().max(80),
  slug: z.string().trim().min(3).max(70).regex(SLUG_PATTERN),
  languages: z.array(z.enum(LANGUAGES)).max(6),
});

export const sportStepSchema = z.object({
  primarySport: z.enum(SPORTS),
  otherSports: z.array(z.enum(SPORTS)).max(3),
  athleteStatus: z.enum(ATHLETE_STATUSES),
  yearsPractice: optionalYears,
  highestLevel: z.enum(ACHIEVEMENT_LEVELS),
});

export const achievementSchema = z.object({
  year,
  title: z.string().trim().min(2).max(120),
  competition: z.string().trim().max(120),
  level: z.enum(ACHIEVEMENT_LEVELS),
  result: z.string().trim().max(80),
  sport: z.enum(SPORTS),
});

export const experienceSchema = z
  .object({
    role: z.string().trim().min(2).max(80),
    organization: z.string().trim().min(2).max(120),
    startDate: z.iso.date(),
    endDate: z.iso.date().or(z.literal("")),
    description: z.string().trim().max(500),
  })
  .refine((e) => !e.endDate || e.endDate >= e.startDate, { path: ["endDate"] });

export const coachingInfoSchema = z.object({
  yearsCoaching: optionalYears,
  specialties: z.array(z.string().trim().min(2).max(30)).max(10),
});

export const educationSchema = z.object({
  degree: z.string().trim().min(2).max(120),
  school: z.string().trim().min(2).max(120),
  year,
});

export const certificationSchema = z.object({
  title: z.string().trim().min(2).max(120),
  issuer: z.string().trim().min(2).max(120),
  year,
});

export const coachingStepSchema = z.object({
  bio: z.string().trim().max(1200),
  zones: z.array(z.enum(CITIES)).max(9),
  videoUrl: videoUrlSchema,
  socials: z.object({ instagram: handleSchema, facebook: handleSchema, tiktok: handleSchema, linkedin: handleSchema }),
  price: z.number().int().min(5).max(1000),
  duration: z.number().int().min(15).max(240),
});

export const publishSchema = z.object({
  cvTemplate: z.enum(CV_TEMPLATES),
  cvPublic: z.boolean(),
});

export type IdentityInput = z.infer<typeof identitySchema>;
export type SportStepInput = z.infer<typeof sportStepSchema>;
export type AchievementInput = z.infer<typeof achievementSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type CoachingInfoInput = z.infer<typeof coachingInfoSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type CertificationInput = z.infer<typeof certificationSchema>;
export type CoachingStepInput = z.infer<typeof coachingStepSchema>;
export type PublishInput = z.infer<typeof publishSchema>;

