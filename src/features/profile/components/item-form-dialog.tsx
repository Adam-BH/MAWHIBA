"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { ZodType } from "zod";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/shared/field-error";
import { SubmitButton } from "@/components/shared/submit-button";
import type { ActionResult } from "@/lib/action-result";
import { useAction } from "@/lib/use-action";

export type FieldSpec = {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "textarea" | "select";
  options?: readonly { value: string; label: string }[];
  placeholder?: string;
  optional?: boolean;
};

/** Small generic add/edit dialog: same zod schema on the client (field errors) and in the server action. */
export function ItemFormDialog<T>({ title, trigger, fields, schema, defaults = {}, onSave }: {
  title: string;
  trigger: React.ReactNode;
  fields: FieldSpec[];
  schema: ZodType<T>;
  defaults?: Record<string, string | number | null>;
  onSave: (values: T) => Promise<ActionResult>;
}) {
  const t = useTranslations("builder");
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { pending, run } = useAction();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const values = Object.fromEntries(fields.map((f) => {
      const raw = String(data.get(f.name) ?? "");
      return [f.name, f.type === "number" ? (raw === "" ? undefined : Number(raw)) : raw];
    }));
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    run(() => onSave(parsed.data), { success: t("saved"), onSuccess: () => setOpen(false) });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <form onSubmit={submit} className="grid gap-4" noValidate>
          <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
          {fields.map((f) => {
            const id = `item-${f.name}`;
            const common = { id, name: f.name, defaultValue: defaults[f.name] ?? "", placeholder: f.placeholder, "aria-invalid": !!errors[f.name] };
            return (
              <div key={f.name} className="grid gap-2">
                <Label htmlFor={id}>{f.label}{f.optional && <span className="font-normal text-muted-foreground"> ({t("optional")})</span>}</Label>
                {f.type === "textarea" ? <Textarea rows={3} {...common} />
                  : f.type === "select" ? (
                    <select {...common} className="h-9 rounded-lg border border-input bg-card px-3 text-sm">
                      {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : <Input type={f.type} inputMode={f.type === "number" ? "numeric" : undefined} {...common} />}
                <FieldError message={errors[f.name]} />
              </div>
            );
          })}
          <DialogFooter><SubmitButton pending={pending}>{t("save")}</SubmitButton></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
