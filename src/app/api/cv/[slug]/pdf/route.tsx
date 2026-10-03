import { renderToBuffer } from "@react-pdf/renderer";
import { getTranslations } from "next-intl/server";
import { CvDocument } from "@/features/cv/pdf/cv-document";
import { qrPngDataUrl } from "@/features/cv/qr";
import { canViewCv, getCoachFull, resolveCoach } from "@/features/cv/queries";
import { getCurrentUser } from "@/lib/auth";
import { CV_TEMPLATES } from "@/lib/config";
import { formatLongDate } from "@/lib/dates";
import { siteUrl } from "@/lib/storage-url";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ref = await resolveCoach(slug);
  const [coach, viewer] = await Promise.all([ref ? getCoachFull(ref.user_id) : null, getCurrentUser()]);
  if (!coach?.slug || !canViewCv(coach, viewer)) return new Response("Not found", { status: 404 });

  const requested = new URL(request.url).searchParams.get("template");
  const template = CV_TEMPLATES.find((x) => x === requested) ?? (coach.cv_template === "classique" ? "classique" : "moderne");
  const urls = { cv: siteUrl(`/cv/${coach.slug}`), profile: siteUrl(`/coaches/${coach.slug}`) };
  const [tr, qr] = await Promise.all([getTranslations("cv"), qrPngDataUrl(urls.cv)]);
  // react-pdf components take a plain label function; keys are validated by the web CV, which uses the same namespace.
  const t = (key: string, values?: Record<string, string | number>) => tr(key as Parameters<typeof tr>[0], values);

  const pdf = await renderToBuffer(<CvDocument coach={coach} template={template} qr={qr} t={t} urls={urls} generated={formatLongDate(new Date())} />);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="CV-MAWHIBA-${coach.slug}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
