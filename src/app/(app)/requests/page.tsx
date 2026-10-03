import { ClientRequests } from "@/features/requests/components/client-requests";
import { CoachBoard } from "@/features/requests/components/coach-board";
import { requireRole } from "@/lib/auth";

export default async function RequestsPage({ searchParams }: { searchParams: Promise<{ city?: string }> }) {
  const user = await requireRole(["client", "coach"]);
  const { city } = await searchParams;
  return user.role === "coach" ? <CoachBoard user={user} city={city} /> : <ClientRequests userId={user.id} />;
}
