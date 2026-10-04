import { describe, expect, it } from "vitest";
import { profileStrength, strengthLevel, type StrengthInput } from "@/lib/profile-strength";
import { slugify, uniqueSlug } from "@/lib/slug";
import { coachingStepSchema, HANDLE_PATTERN, VIDEO_URL_PATTERN } from "@/lib/validations/profile-builder";

const EMPTY: StrengthInput = {
  avatar: false, cover: false, tagline: false, city: false, languages: 0, primarySport: false, athleteStatus: false,
  yearsPractice: false, highestLevel: false, achievements: 0, verifiedAchievements: 0, experiences: 0, yearsCoaching: false,
  specialties: 0, education: 0, certifications: 0, mawhibaBadges: 0, bioLength: 0, zones: 0, location: false, video: false, socials: 0,
};
const FULL: StrengthInput = {
  avatar: true, cover: true, tagline: true, city: true, languages: 2, primarySport: true, athleteStatus: true,
  yearsPractice: true, highestLevel: true, achievements: 4, verifiedAchievements: 2, experiences: 2, yearsCoaching: true,
  specialties: 3, education: 1, certifications: 1, mawhibaBadges: 1, bioLength: 400, zones: 2, location: true, video: true, socials: 2,
};

describe("profile strength", () => {
  it("empty profile scores 0 and suggests the biggest win", () => {
    const s = profileStrength(EMPTY);
    expect(s.score).toBe(0);
    expect(s.level).toBe("debutant");
    expect(s.next).toEqual({ key: "achievements", gain: 15, count: 3 });
  });

  it("weights sum to exactly 100", () => {
    const s = profileStrength(FULL);
    expect(s.score).toBe(100);
    expect(s.level).toBe("elite");
    expect(s.next).toBeNull();
  });

  it("achievements score 5 per item up to 3, bio by length", () => {
    expect(profileStrength({ ...EMPTY, achievements: 1 }).score).toBe(5);
    expect(profileStrength({ ...EMPTY, achievements: 2 }).score).toBe(10);
    expect(profileStrength({ ...EMPTY, achievements: 7 }).score).toBe(15);
    expect(profileStrength({ ...FULL, achievements: 2 }).next).toEqual({ key: "achievements", gain: 5, count: 1 });
    expect(profileStrength({ ...EMPTY, bioLength: 49 }).score).toBe(0);
    expect(profileStrength({ ...EMPTY, bioLength: 50 }).score).toBe(4);
    expect(profileStrength({ ...EMPTY, bioLength: 150 }).score).toBe(8);
  });

  it("a coach who fills every wizard field without platform badges/verification still reaches 85%+", () => {
    expect(profileStrength({ ...FULL, verifiedAchievements: 0, mawhibaBadges: 0 }).score).toBe(92);
  });

  it.each([[0, "debutant"], [39, "debutant"], [40, "solide"], [69, "solide"], [70, "pro"], [89, "pro"], [90, "elite"], [100, "elite"]] as const)(
    "%d → %s", (score, level) => expect(strengthLevel(score)).toBe(level),
  );
});

describe("slugs", () => {
  it.each([
    ["Amira Ben Salah", "amira-ben-salah"],
    ["Hamza Saïdi", "hamza-saidi"],
    ["Élodie  Ça-va  Ñandú", "elodie-ca-va-nandu"],
    ["  --Coach!!  ", "coach"],
    ["محمد", "coach"],
    ["", "coach"],
  ])("%j → %s", (name, slug) => expect(slugify(name)).toBe(slug));

  it("caps length without a trailing dash", () => {
    const s = slugify("a".repeat(59) + " b c d");
    expect(s.length).toBeLessThanOrEqual(60);
    expect(s.endsWith("-")).toBe(false);
  });

  it("deduplicates with -2, -3…", () => {
    expect(uniqueSlug("Amira Ben Salah", [])).toBe("amira-ben-salah");
    expect(uniqueSlug("Amira Ben Salah", ["amira-ben-salah"])).toBe("amira-ben-salah-2");
    expect(uniqueSlug("Amira Ben Salah", ["amira-ben-salah", "amira-ben-salah-2"])).toBe("amira-ben-salah-3");
  });
});

describe("URL & handle validation", () => {
  it.each([
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", true],
    ["https://youtu.be/dQw4w9WgXcQ", true],
    ["https://youtube.com/shorts/abcdef12", true],
    ["https://www.instagram.com/reel/C1a2b3c4/", true],
    ["https://instagram.com/p/XYZ123", true],
    ["http://youtu.be/dQw4w9WgXcQ", false],
    ["https://evil.com/?youtube.com/watch?v=dQw4w9WgXcQ", false],
    ["javascript:alert(1)", false],
    ["https://vimeo.com/123456", false],
  ])("video %s → %s", (url, valid) => expect(VIDEO_URL_PATTERN.test(url)).toBe(valid));

  it.each([
    ["amira.swim", true],
    ["@amira_bs", true],
    ["coach-amira", true],
    ["a", false],
    ["https://instagram.com/amira", false],
    ["amira swim", false],
    ["amira@mail.com", false],
  ])("handle %s → %s", (handle, valid) => expect(HANDLE_PATTERN.test(handle)).toBe(valid));

  it("coaching step accepts empty optional links", () => {
    const base = { bio: "", zones: [], videoUrl: "", socials: { instagram: "", facebook: "", tiktok: "", linkedin: "" }, price: 40, duration: 60 };
    expect(coachingStepSchema.safeParse(base).success).toBe(true);
    expect(coachingStepSchema.safeParse({ ...base, videoUrl: "https://vimeo.com/1" }).success).toBe(false);
    expect(coachingStepSchema.safeParse({ ...base, socials: { ...base.socials, instagram: "https://x.com" } }).success).toBe(false);
  });
});
