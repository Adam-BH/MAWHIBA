import { requireRole } from "@/lib/auth";

/** Full-screen, no sidebar. Guarded here so the redirect is a real 307 before any streaming. */
export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["client"]);
  return children;
}
