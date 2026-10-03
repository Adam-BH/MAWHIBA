import { requireRole } from "@/lib/auth";

export default async function PaymentsLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["client", "coach"]);
  return children;
}
