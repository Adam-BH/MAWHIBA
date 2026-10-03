import Link from "next/link";
import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Points } from "@/components/shared/points";
import { UserAvatar } from "@/components/shared/user-avatar";
import { VerifyActions } from "@/features/admin/components/verify-actions";
import type { AdminCoach } from "@/features/admin/queries";

export function CoachAdminRow({ coach }: { coach: AdminCoach }) {
  const t = useTranslations("admin.coaches");
  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <UserAvatar name={coach.profile.full_name} src={coach.profile.avatar_url} />
        <div className="min-w-0">
          <p className="truncate font-medium">
            {coach.verified ? <Link className="hover:underline" href={`/coaches/${coach.user_id}`}>{coach.profile.full_name}</Link> : coach.profile.full_name}
          </p>
          <p className="truncate text-sm text-muted-foreground">{coach.profile.email} · {coach.profile.city ?? "—"}</p>
          <p className="truncate text-sm text-muted-foreground">{coach.sports.join(", ") || "—"} · <Points value={coach.price_per_session} /></p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {coach.proofUrl ? (
          <Button asChild size="sm" variant="ghost"><a href={coach.proofUrl} target="_blank" rel="noreferrer"><FileText />{t("viewProof")}</a></Button>
        ) : !coach.verified && <span className="text-sm text-muted-foreground">{t("noProof")}</span>}
        {(coach.verified || coach.proof_path) && <VerifyActions coachId={coach.user_id} verified={coach.verified} />}
      </div>
    </li>
  );
}
