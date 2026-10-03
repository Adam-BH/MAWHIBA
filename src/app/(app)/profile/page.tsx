import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CoachBadges } from "@/components/shared/coach-badges";
import { PageHeader } from "@/components/shared/page-header";
import { UserAvatar } from "@/components/shared/user-avatar";
import { uploadAvatarAction, uploadProofAction } from "@/features/coaches/actions";
import { CoachProfileForm } from "@/features/coaches/components/coach-profile-form";
import { FileUpload } from "@/features/coaches/components/file-upload";
import { ProfileForm } from "@/features/coaches/components/profile-form";
import { getMyCoachProfile, listInclusiveCoachIds } from "@/features/coaches/queries";
import { requireUser } from "@/lib/auth";
import type { Sport } from "@/lib/config";
import type { ProfileInput } from "@/lib/validations/profile";

export default async function ProfilePage() {
  const user = await requireUser();
  const isCoach = user.role === "coach";
  const [t, coach, inclusiveIds] = await Promise.all([
    getTranslations("profile"), isCoach ? getMyCoachProfile(user.id) : null, listInclusiveCoachIds(),
  ]);
  const base = { fullName: user.full_name, phone: user.phone ?? "", city: (user.city ?? "") as ProfileInput["city"] };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader title={t("title")} />
      <Card>
        <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <UserAvatar name={user.full_name} src={user.avatar_url} className="size-20" />
          <div className="flex flex-1 flex-col gap-2">
            <p className="text-lg font-semibold">{user.full_name}</p>
            {coach && <CoachBadges verified={coach.verified} inclusive={inclusiveIds.has(user.id)} />}
          </div>
          <FileUpload action={uploadAvatarAction} accept="image/png,image/jpeg,image/webp" label={t("uploadAvatar")} success={t("avatarSaved")} />
        </CardContent>
      </Card>

      {coach && (
        <Card>
          <CardHeader>
            <CardTitle>{t("proofTitle")}</CardTitle>
            <CardDescription>
              {coach.verified ? t("proofVerified") : coach.proof_path ? t("proofPending") : t("proofMissing")}
            </CardDescription>
          </CardHeader>
          {!coach.verified && (
            <CardContent>
              <FileUpload action={uploadProofAction} accept="image/png,image/jpeg,image/webp,application/pdf"
                label={coach.proof_path ? t("replaceProof") : t("uploadProof")} success={t("proofSaved")} />
            </CardContent>
          )}
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>{isCoach ? t("coachInfo") : t("info")}</CardTitle></CardHeader>
        <CardContent>
          {coach ? (
            <CoachProfileForm defaults={{
              ...base,
              sports: coach.sports as Sport[],
              headline: coach.headline ?? "",
              bio: coach.bio ?? "",
              achievements: coach.achievements ?? "",
              price: coach.price_per_session,
              duration: coach.session_duration_min,
            }} />
          ) : (
            <ProfileForm defaults={base} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
