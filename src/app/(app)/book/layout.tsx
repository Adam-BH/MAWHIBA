import { requireRole } from "@/lib/auth";

export default async function BookLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["client"]);
  return children;
}
