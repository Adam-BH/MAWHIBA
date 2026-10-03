import { notFound } from "next/navigation";
import { ClientRequestDetail } from "@/features/requests/components/client-request-detail";
import { CoachRequestDetail } from "@/features/requests/components/coach-request-detail";
import { requireRole } from "@/lib/auth";
import { uuid } from "@/lib/validations/forms";

export default async function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["client", "coach"]);
  const { id } = await params;
  if (!uuid.safeParse(id).success) notFound();
  return user.role === "coach" ? <CoachRequestDetail requestId={id} user={user} /> : <ClientRequestDetail requestId={id} userId={user.id} />;
}
