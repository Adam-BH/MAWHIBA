import { requireRole } from "@/lib/auth";

export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["coach"]);
  return children;
}
