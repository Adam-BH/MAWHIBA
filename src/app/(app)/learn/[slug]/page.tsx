import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { LearnStepper } from "@/features/certifications/components/learn-stepper";
import { getCertification } from "@/features/certifications/queries";
import { requireRole } from "@/lib/auth";

export default async function LearnModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await requireRole(["coach"]);
  const { slug } = await params;
  const cert = await getCertification(slug, user.id);
  if (!cert) notFound();
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={cert.title} />
      <LearnStepper slug={cert.slug} lessons={cert.lessons} quiz={cert.quiz} passScore={cert.pass_score} />
    </div>
  );
}
