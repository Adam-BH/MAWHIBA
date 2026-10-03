import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { CvSheet } from "@/features/cv/components/cv-sheet";
import { PrintButton } from "@/features/cv/components/print-button";
import { qrSvg } from "@/features/cv/qr";
import { canViewCv, getCoachFull, resolveCoach } from "@/features/cv/queries";
import { getCurrentUser } from "@/lib/auth";
import { siteUrl } from "@/lib/storage-url";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const ref = await resolveCoach(slug);
  const [coach, viewer] = await Promise.all([ref ? getCoachFull(ref.user_id) : null, getCurrentUser()]);
  return coach && canViewCv(coach, viewer) ? coach : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [coach, t] = await Promise.all([load(slug), getTranslations("cv")]);
  if (!coach) return {};
  const title = t("metaTitle", { name: coach.profile.full_name });
  return {
    title,
    description: coach.tagline ?? undefined,
    openGraph: { title, description: coach.tagline ?? undefined, images: [{ url: `/api/card/${coach.slug}/og`, width: 1200, height: 630 }] },
  };
}

export default async function CvPage({ params }: Props) {
  const { slug } = await params;
  const coach = await load(slug);
  if (!coach || !coach.slug) notFound();
  const [t, qr] = await Promise.all([getTranslations("cv"), qrSvg(siteUrl(`/cv/${coach.slug}`))]);

  return (
    <main className="min-h-dvh bg-muted px-0 py-0 sm:px-4 sm:py-8 print:bg-card print:p-0">
      <div className="mx-auto mb-4 flex max-w-[210mm] flex-wrap gap-2 px-4 sm:px-0 print:hidden">
        <Button asChild variant="ghost"><Link href={`/coaches/${coach.slug}`}><ArrowLeft />{t("backToProfile")}</Link></Button>
        <div className="ms-auto flex flex-wrap gap-2">
          <PrintButton />
          <Button asChild><a href={`/api/cv/${coach.slug}/pdf?template=${coach.cv_template}`}><Download />{t("downloadPdf")}</a></Button>
          <Button asChild variant="outline"><a href={`/api/cv/${coach.slug}/pdf?template=${coach.cv_template === "moderne" ? "classique" : "moderne"}`}>
            <Download />{coach.cv_template === "moderne" ? t("pdfClassic") : t("pdfModern")}</a></Button>
        </div>
      </div>
      <CvSheet coach={coach} qr={qr} />
    </main>
  );
}
