import { AdminDashboard } from "@/features/dashboard/components/admin-dashboard";
import { ClientDashboard } from "@/features/dashboard/components/client-dashboard";
import { CoachDashboard } from "@/features/dashboard/components/coach-dashboard";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireUser();
  if (user.role === "admin") return <AdminDashboard />;
  if (user.role === "coach") return <CoachDashboard user={user} />;
  return <ClientDashboard user={user} />;
}
