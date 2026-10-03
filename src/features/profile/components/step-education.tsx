"use client";

import Link from "next/link";
import { Award, GraduationCap, Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { deleteItemAction, saveCertificationAction, saveEducationAction } from "@/features/profile/item-actions";
import { ItemFormDialog, type FieldSpec } from "@/features/profile/components/item-form-dialog";
import { StepNav } from "@/features/profile/components/step-nav";
import { VerificationStatus } from "@/features/profile/components/verification-status";
import { useWizard } from "@/features/profile/components/wizard-context";
import { certificationSchema, educationSchema } from "@/lib/validations/profile-builder";
import { useAction } from "@/lib/use-action";

function Row({ title, subtitle, extra, edit, onDelete, deleteLabel }: {
  title: string; subtitle: string; extra?: React.ReactNode; edit: React.ReactNode; onDelete: () => void; deleteLabel: string;
}) {
  return (
    <li className="flex items-start gap-2 rounded-xl border bg-card p-3">
      <div className="min-w-0 flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        {extra}
      </div>
      {edit}
      <Button type="button" variant="ghost" size="icon-sm" aria-label={deleteLabel} onClick={onDelete}><Trash2 /></Button>
    </li>
  );
}

export function StepEducation() {
  const t = useTranslations("builder.education");
  const { coach } = useWizard();
  const { run } = useAction();
  const year = new Date().getFullYear();
  const eduFields: FieldSpec[] = [
    { name: "degree", label: t("degree"), type: "text", placeholder: t("degreePlaceholder") },
    { name: "school", label: t("school"), type: "text", placeholder: t("schoolPlaceholder") },
    { name: "year", label: t("year"), type: "number" },
  ];
  const certFields: FieldSpec[] = [
    { name: "title", label: t("certTitle"), type: "text", placeholder: t("certPlaceholder") },
    { name: "issuer", label: t("issuer"), type: "text", placeholder: t("issuerPlaceholder") },
    { name: "year", label: t("year"), type: "number" },
  ];
  const del = (table: "education" | "external_certifications", id: string) =>
    confirm(t("deleteConfirm")) && run(() => deleteItemAction(table, id));
  const editIcon = <Button type="button" variant="ghost" size="icon-sm" aria-label={t("edit")}><Pencil /></Button>;

  return (
    <div className="grid gap-6">
      <section className="grid gap-2">
        <h3 className="flex items-center gap-2 font-semibold"><Award className="size-4 text-primary" />{t("mawhibaBadges")}</h3>
        {coach.stats.badges.length ? (
          <ul className="flex flex-wrap gap-2">
            {coach.stats.badges.map((b) => (
              <li key={b.slug} className="rounded-full bg-accent/15 px-3 py-1 text-sm font-medium text-accent-foreground">{b.title} · {t("issuedBy")}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{t("noBadges")} <Link href="/learn" className="font-medium text-primary underline">{t("goLearn")}</Link></p>
        )}
      </section>
      <section className="grid gap-2">
        <h3 className="flex items-center gap-2 font-semibold"><GraduationCap className="size-4 text-primary" />{t("educationTitle")}</h3>
        <ul className="flex flex-col gap-2">
          {coach.education.map((e) => (
            <Row key={e.id} title={e.degree} subtitle={`${e.school} · ${e.year}`} deleteLabel={t("delete")} onDelete={() => del("education", e.id)}
              edit={<ItemFormDialog title={t("editEducation")} fields={eduFields} schema={educationSchema} defaults={{ degree: e.degree, school: e.school, year: e.year }}
                onSave={(x) => saveEducationAction(x, e.id)} trigger={editIcon} />} />
          ))}
        </ul>
        <div><ItemFormDialog title={t("addEducation")} fields={eduFields} schema={educationSchema} defaults={{ year }}
          onSave={(x) => saveEducationAction(x)} trigger={<Button type="button" variant="outline"><Plus />{t("addEducation")}</Button>} /></div>
      </section>
      <section className="grid gap-2">
        <h3 className="flex items-center gap-2 font-semibold"><Award className="size-4 text-primary" />{t("certTitleSection")}</h3>
        <ul className="flex flex-col gap-2">
          {coach.certifications.map((c) => (
            <Row key={c.id} title={c.title} subtitle={`${c.issuer} · ${c.year}`} deleteLabel={t("delete")} onDelete={() => del("external_certifications", c.id)}
              extra={<div className="mt-1"><VerificationStatus kind="certification" id={c.id} verified={c.verified} hasProof={!!c.file_path} /></div>}
              edit={<ItemFormDialog title={t("editCert")} fields={certFields} schema={certificationSchema} defaults={{ title: c.title, issuer: c.issuer, year: c.year }}
                onSave={(x) => saveCertificationAction(x, c.id)} trigger={editIcon} />} />
          ))}
        </ul>
        <div><ItemFormDialog title={t("addCert")} fields={certFields} schema={certificationSchema} defaults={{ year }}
          onSave={(x) => saveCertificationAction(x)} trigger={<Button type="button" variant="outline"><Plus />{t("addCert")}</Button>} /></div>
      </section>
      <StepNav submit={false} />
    </div>
  );
}
