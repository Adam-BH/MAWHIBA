import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { INCLUSIVE_CERT_SLUG } from "@/lib/config";
import { profileStrength, type StrengthInput } from "@/lib/profile-strength";
import { uuid } from "@/lib/validations/forms";

type Badge = { slug: string; title: string; completed_at: string };

/** Accepts a slug or a legacy uuid; returns the coach id and canonical slug. */
export const resolveCoach = cache(async (param: string) => {
  const supabase = await createClient();
  const column = uuid.safeParse(param).success ? "user_id" : "slug";
  const { data } = await supabase.from("coach_profiles").select("user_id, slug").eq(column, param).maybeSingle();
  return data;
});

/** Everything the profile, CV, card and wizard need. RLS decides what the viewer may see. */
export const getCoachFull = cache(async (coachId: string) => {
  const supabase = await createClient();
  const [coachRes, achievements, experiences, education, certifications, stats] = await Promise.all([
    supabase.from("coach_profiles").select("*, profile:profiles!inner(full_name, city, avatar_url, created_at)").eq("user_id", coachId).maybeSingle(),
    supabase.from("athletic_achievements").select("*").eq("coach_id", coachId).order("sort").order("year", { ascending: false }),
    supabase.from("coaching_experiences").select("*").eq("coach_id", coachId).order("sort").order("start_date", { ascending: false }),
    supabase.from("education").select("*").eq("coach_id", coachId).order("year", { ascending: false }),
    supabase.from("external_certifications").select("*").eq("coach_id", coachId).order("year", { ascending: false }),
    supabase.from("coach_cv_stats").select("*").eq("coach_id", coachId).maybeSingle(),
  ]);
  const coach = coachRes.data;
  if (!coach) return null;
  const badges = ((stats.data?.badges ?? []) as Badge[]);
  return {
    ...coach,
    socials: (coach.socials ?? {}) as Partial<Record<string, string>>,
    achievements: achievements.data ?? [],
    experiences: experiences.data ?? [],
    education: education.data ?? [],
    certifications: certifications.data ?? [],
    stats: {
      completedSessions: stats.data?.completed_sessions ?? 0,
      distinctClients: stats.data?.distinct_clients ?? 0,
      ratingAvg: Number(coach.rating_avg),
      ratingCount: coach.rating_count,
      memberSince: stats.data?.member_since ?? coach.profile.created_at,
      badges,
    },
    inclusive: badges.some((b) => b.slug === INCLUSIVE_CERT_SLUG),
  };
});

export type CoachFull = NonNullable<Awaited<ReturnType<typeof getCoachFull>>>;

export function strengthInputOf(c: CoachFull): StrengthInput {
  return {
    avatar: !!c.profile.avatar_url,
    cover: !!c.cover_path,
    tagline: !!c.tagline,
    city: !!c.profile.city,
    languages: c.languages.length,
    primarySport: !!c.primary_sport,
    athleteStatus: !!c.athlete_status,
    yearsPractice: c.years_practice !== null,
    highestLevel: !!c.highest_level,
    achievements: c.achievements.length,
    verifiedAchievements: c.achievements.filter((a) => a.verified).length,
    experiences: c.experiences.length,
    yearsCoaching: c.years_coaching !== null,
    specialties: c.specialties.length,
    education: c.education.length,
    certifications: c.certifications.length,
    mawhibaBadges: c.stats.badges.length,
    bioLength: (c.bio ?? "").trim().length,
    zones: c.zones.length,
    video: !!c.video_url,
    socials: Object.values(c.socials).filter(Boolean).length,
  };
}

export function strengthOf(c: CoachFull) {
  return profileStrength(strengthInputOf(c));
}

/** CVs are public when the coach is verified and opted in; owners and admins always see theirs. */
export function canViewCv(c: CoachFull, viewer: { id: string; role: string } | null) {
  return (c.verified && c.cv_public) || viewer?.id === c.user_id || viewer?.role === "admin";
}
