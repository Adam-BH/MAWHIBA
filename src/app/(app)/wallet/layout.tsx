import { requireRole } from "@/lib/auth";

export default async function WalletLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["client", "coach"]);
  return children;
}
