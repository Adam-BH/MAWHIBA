import Link from "next/link";
import { Download, FileText, ImageDown, Pencil, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShareButtons } from "@/features/cv/components/share-buttons";
import { getCoachFull, strengthOf } from "@/features/cv/queries";
import { StrengthMeter } from "@/features/profile/components/strength-meter";
import { STRENGTH_COMPLETE_FROM, STRENGTH_NUDGE_BELOW } from "@/lib/profile-strength";
import { siteUrl } from "@/lib/storage-url";

export async function MyCvCard({ coachId }: { coachId: string }) {
  const [t, coach] = await Promise.all([getTranslations("myCv"), getCoachFull(coachId)]);
  if (!coach?.slug) return null;
  const strength = strengthOf(coach);

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2"><FileText className="size-5 text-accent" />{t("title")}</CardTitle>
        {strength.score >= STRENGTH_COMPLETE_FROM && <Badge className="border-transparent bg-accent text-accent-foreground"><Sparkles />{t("complete")}</Badge>}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <StrengthMeter {...strength} />
        {strength.score < STRENGTH_NUDGE_BELOW && (
          <Alert className="border-warning/50 bg-warning/15">
            <AlertDescription>
              {t("nudge")}
              <Button asChild size="sm" className="mt-2"><Link href="/profile"><Pencil />{t("improve")}</Link></Button>
            </AlertDescription>
          </Alert>
        )}
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline"><Link href={`/cv/${coach.slug}`}><FileText />{t("preview")}</Link></Button>
          <Button asChild variant="outline"><a href={`/api/cv/${coach.slug}/pdf`}><Download />{t("pdf")}</a></Button>
          {coach.verified && (
            <>
              <ShareButtons url={siteUrl(`/cv/${coach.slug}`)} text={t("shareText")} />
              <Button asChild variant="outline"><a href={`/api/card/${coach.slug}/og?format=story&download=1`}><ImageDown />{t("card")}</a></Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
