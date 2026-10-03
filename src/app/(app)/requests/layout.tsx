import { requireRole } from "@/lib/auth";

export default async function RequestsLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["client", "coach"]);
  return children;
}
