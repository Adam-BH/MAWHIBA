"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAction } from "@/lib/use-action";
import type { ActionResult } from "@/lib/action-result";

export function FileUpload({ action, accept, label, success }: {
  action: (formData: FormData) => Promise<ActionResult<unknown>>;
  accept: string;
  label: string;
  success: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const { pending, run } = useAction();

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.set("file", file);
    run(() => action(formData), { success });
    e.target.value = "";
  }

  return (
    <>
      <input ref={input} type="file" accept={accept} className="sr-only" onChange={onChange} tabIndex={-1} aria-hidden />
      <Button type="button" variant="outline" disabled={pending} onClick={() => input.current?.click()}>
        <Upload />{label}
      </Button>
    </>
  );
}
