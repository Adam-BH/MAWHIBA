import Link from "next/link";
import { BookOpen, CheckCircle2, Clock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { listCertifications } from "@/features/certifications/queries";
import { requireRole } from "@/lib/auth";

export default async function LearnPage() {
  const user = await requireRole(["coach"]);
  const [t, certs] = await Promise.all([getTranslations("learn"), listCertifications(user.id)]);
  const passed = certs.filter((c) => c.status?.passed).length;

  return (
    <>
      <PageHeader title={t("title")} description={t("subtitle")} />
      {certs.length > 0 && (
        <div className="mb-6 flex items-center gap-3">
          <Progress value={(passed / certs.length) * 100} className="max-w-xs flex-1" />
          <span className="text-sm text-muted-foreground">{t("progress", { passed, total: certs.length })}</span>
        </div>
      )}
      {certs.length === 0 ? <EmptyState title={t("empty")} /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {certs.map((cert) => (
            <Card key={cert.id}>
              <CardHeader>
                <CardTitle>{cert.title}</CardTitle>
                <CardDescription>{cert.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="size-4" />{t("lessonsCount", { count: cert.lessonCount })}
                <Clock className="ms-2 size-4" />{t("minutes", { count: cert.minutes })}
                {cert.status?.passed && <span className="ms-auto flex items-center gap-1 font-medium text-success"><CheckCircle2 className="size-4" />{t("passed")}</span>}
              </CardContent>
              <CardFooter>
                <Button asChild variant={cert.status?.passed ? "outline" : "default"}>
                  <Link href={`/learn/${cert.slug}`}>{cert.status?.passed ? t("review") : t("start")}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
