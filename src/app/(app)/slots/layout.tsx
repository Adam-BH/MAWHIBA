import { requireRole } from "@/lib/auth";

export default async function SlotsLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["coach"]);
  return children;
}
