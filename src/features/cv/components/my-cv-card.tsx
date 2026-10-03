import Link from "next/link";
import { Download, FileText, ImageDown } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/shared/section";
import { ShareButtons } from "@/features/cv/components/share-buttons";
import { getCoachFull, strengthOf } from "@/features/cv/queries";
import { StrengthMeter } from "@/features/profile/components/strength-meter";
import { STRENGTH_NUDGE_BELOW } from "@/lib/profile-strength";
import { siteUrl } from "@/lib/storage-url";

export async function MyCvCard({ coachId }: { coachId: string }) {
  const [t, coach] = await Promise.all([getTranslations("myCv"), getCoachFull(coachId)]);
  if (!coach?.slug) return null;
  const strength = strengthOf(coach);

  return (
    <Section title={t("title")}
      action={strength.score < STRENGTH_NUDGE_BELOW && <Link href="/profile" className="text-sm font-semibold text-primary hover:underline">{t("improve")}</Link>}>
      <StrengthMeter {...strength} />
      <div className="mt-4 flex flex-wrap items-center gap-1">
        <Button asChild variant="outline" size="sm" className="me-2"><Link href={`/cv/${coach.slug}`}><FileText />{t("preview")}</Link></Button>
        <Button asChild variant="ghost" size="sm"><a href={`/api/cv/${coach.slug}/pdf`}><Download />{t("pdf")}</a></Button>
        {coach.verified && (
          <>
            <ShareButtons url={siteUrl(`/cv/${coach.slug}`)} text={t("shareText")} />
            <Button asChild variant="ghost" size="sm"><a href={`/api/card/${coach.slug}/og?format=story&download=1`}><ImageDown />{t("card")}</a></Button>
          </>
        )}
      </div>
    </Section>
  );
}
