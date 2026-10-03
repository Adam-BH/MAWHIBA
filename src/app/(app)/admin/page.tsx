import { AdminDashboard } from "@/features/dashboard/components/admin-dashboard";
import { requireRole } from "@/lib/auth";

export default async function AdminPage() {
  await requireRole(["admin"]);
  return <AdminDashboard />;
}
