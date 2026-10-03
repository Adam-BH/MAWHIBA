import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { UserAvatar } from "@/components/shared/user-avatar";
import { uploadAvatarAction, uploadProofAction } from "@/features/coaches/actions";
import { FileUpload } from "@/features/coaches/components/file-upload";
import { ProfileForm } from "@/features/coaches/components/profile-form";
import { getCoachFull, strengthInputOf } from "@/features/cv/queries";
import { listCoachOffers } from "@/features/offers/queries";
import { isAiBioEnabled } from "@/features/profile/ai-flag";
import { ProfileWizard } from "@/features/profile/components/profile-wizard";
import { requireUser } from "@/lib/auth";
import { PROFILE_STEPS } from "@/lib/config";
import type { ProfileInput } from "@/lib/validations/profile";

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ step?: string }> }) {
  const user = await requireUser();
  const t = await getTranslations("profile");

  if (user.role !== "coach") {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <PageHeader title={t("title")} />
        <Card>
          <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <UserAvatar name={user.full_name} src={user.avatar_url} className="size-20" />
            <p className="flex-1 text-lg font-semibold">{user.full_name}</p>
            <FileUpload action={uploadAvatarAction} accept="image/png,image/jpeg,image/webp" label={t("uploadAvatar")} success={t("avatarSaved")} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t("info")}</CardTitle></CardHeader>
          <CardContent>
            <ProfileForm defaults={{ fullName: user.full_name, phone: user.phone ?? "", city: (user.city ?? "") as ProfileInput["city"] }} />
          </CardContent>
        </Card>
      </div>
    );
  }

  const [{ step: stepParam }, coach, offers] = await Promise.all([searchParams, getCoachFull(user.id), listCoachOffers(user.id)]);
  if (!coach) return null;
  const requested = Number(stepParam);
  const step = Number.isInteger(requested) && requested >= 1 && requested <= PROFILE_STEPS ? requested : coach.builder_step;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader title={t("builderTitle")} description={t("builderSubtitle")} />
      {!coach.verified && (
        <Card>
          <CardHeader>
            <CardTitle>{t("proofTitle")}</CardTitle>
            <CardDescription>{coach.proof_path ? t("proofPending") : t("proofMissing")}</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload action={uploadProofAction} accept="image/png,image/jpeg,image/webp,application/pdf"
              label={coach.proof_path ? t("replaceProof") : t("uploadProof")} success={t("proofSaved")} />
          </CardContent>
        </Card>
      )}
      <ProfileWizard coach={coach} step={step} offersCount={offers.length} aiEnabled={isAiBioEnabled()} strengthBase={strengthInputOf(coach)} />
    </div>
  );
}
