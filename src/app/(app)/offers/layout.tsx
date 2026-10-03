import { requireRole } from "@/lib/auth";

export default async function OffersLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["coach"]);
  return children;
}
