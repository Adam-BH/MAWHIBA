"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { LevelChip } from "@/components/shared/level-chip";
import { deleteItemAction, reorderAchievementsAction, saveAchievementAction } from "@/features/profile/item-actions";
import { ItemFormDialog, type FieldSpec } from "@/features/profile/components/item-form-dialog";
import { StepNav } from "@/features/profile/components/step-nav";
import { VerificationStatus } from "@/features/profile/components/verification-status";
import { useWizard } from "@/features/profile/components/wizard-context";
import { ACHIEVEMENT_LEVELS, SPORTS } from "@/lib/config";
import { achievementSchema } from "@/lib/validations/profile-builder";
import { useAction } from "@/lib/use-action";

export function StepAchievements() {
  const t = useTranslations("builder.achievements");
  const tl = useTranslations("levels");
  const { coach } = useWizard();
  const { run } = useAction();
  const [order, setOrder] = useState<string[] | null>(null);
  const [dragged, setDragged] = useState<string | null>(null);
  const byId = new Map(coach.achievements.map((a) => [a.id, a]));
  const serverIds = coach.achievements.map((a) => a.id);
  // Local order (optimistic) first, then any items added since.
  const ids = order ? [...order.filter((id) => byId.has(id)), ...serverIds.filter((id) => !order.includes(id))] : serverIds;
  const items = ids.map((id) => byId.get(id)).filter((a) => a !== undefined);

  const fields: FieldSpec[] = [
    { name: "title", label: t("title"), type: "text", placeholder: t("titlePlaceholder") },
    { name: "competition", label: t("competition"), type: "text", optional: true },
    { name: "result", label: t("result"), type: "text", placeholder: t("resultPlaceholder"), optional: true },
    { name: "year", label: t("year"), type: "number" },
    { name: "level", label: t("level"), type: "select", options: ACHIEVEMENT_LEVELS.map((l) => ({ value: l, label: tl(l) })) },
    { name: "sport", label: t("sport"), type: "select", options: SPORTS.map((s) => ({ value: s, label: s })) },
  ];
  const defaults = { year: new Date().getFullYear(), level: coach.highest_level ?? "regional", sport: coach.primary_sport ?? coach.sports[0] ?? "Natation" };

  function move(ids: string[]) {
    setOrder(ids);
    run(() => reorderAchievementsAction(ids));
  }
  function moveBy(id: string, delta: number) {
    const ids = items.map((a) => a.id);
    const i = ids.indexOf(id);
    const j = i + delta;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    move(ids);
  }
  function dropOn(targetId: string) {
    if (!dragged || dragged === targetId) return;
    const ids = items.map((a) => a.id).filter((id) => id !== dragged);
    ids.splice(ids.indexOf(targetId), 0, dragged);
    setDragged(null);
    move(ids);
  }

  const addButton = (
    <ItemFormDialog title={t("add")} fields={fields} schema={achievementSchema} defaults={defaults}
      onSave={(v) => saveAchievementAction(v)} trigger={<Button type="button"><Plus />{t("add")}</Button>} />
  );

  return (
    <div className="grid gap-4">
      {items.length === 0 ? <EmptyState title={t("empty")} action={addButton} /> : (
        <>
          <ul className="flex flex-col gap-2">
            {items.map((a, i) => (
              <li key={a.id} draggable onDragStart={() => setDragged(a.id)} onDragOver={(e) => e.preventDefault()} onDrop={() => dropOn(a.id)}
                className="flex items-start gap-2 rounded-xl border bg-card p-3 data-[dragging=true]:opacity-50" data-dragging={dragged === a.id}>
                <GripVertical className="mt-1 size-4 shrink-0 cursor-grab text-muted-foreground max-sm:hidden" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display font-semibold text-primary">{a.year}</span>
                    <LevelChip level={a.level} />
                  </div>
                  <p className="font-medium">{a.title}{a.result && <span className="text-muted-foreground"> · {a.result}</span>}</p>
                  {a.competition && <p className="text-sm text-muted-foreground">{a.competition}</p>}
                  <div className="mt-1"><VerificationStatus kind="achievement" id={a.id} verified={a.verified} hasProof={!!a.proof_path} /></div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row">
                  <div className="flex">
                    <Button type="button" variant="ghost" size="icon-sm" disabled={i === 0} aria-label={t("up")} onClick={() => moveBy(a.id, -1)}><ArrowUp /></Button>
                    <Button type="button" variant="ghost" size="icon-sm" disabled={i === items.length - 1} aria-label={t("down")} onClick={() => moveBy(a.id, 1)}><ArrowDown /></Button>
                  </div>
                  <div className="flex">
                    <ItemFormDialog title={t("edit")} fields={fields} schema={achievementSchema}
                      defaults={{ title: a.title, competition: a.competition, result: a.result, year: a.year, level: a.level, sport: a.sport }}
                      onSave={(v) => saveAchievementAction(v, a.id)}
                      trigger={<Button type="button" variant="ghost" size="icon-sm" aria-label={t("edit")}><Pencil /></Button>} />
                    <Button type="button" variant="ghost" size="icon-sm" aria-label={t("delete")}
                      onClick={() => confirm(t("deleteConfirm")) && run(() => deleteItemAction("athletic_achievements", a.id))}><Trash2 /></Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div>{addButton}</div>
        </>
      )}
      <StepNav submit={false} />
    </div>
  );
}
