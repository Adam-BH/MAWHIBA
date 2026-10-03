"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/action-result";

/** Runs a server action in a transition and toasts the outcome. */
export function useAction() {
  const [pending, startTransition] = useTransition();

  function run<T>(action: () => Promise<ActionResult<T>>, opts: { success?: string; onSuccess?: (data: T) => void } = {}) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      if (opts.success) toast.success(opts.success);
      opts.onSuccess?.(result.data);
    });
  }

  return { pending, run };
}
