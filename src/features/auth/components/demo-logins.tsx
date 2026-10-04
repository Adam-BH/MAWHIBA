"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { signInAction } from "@/features/auth/actions";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/demo";
import { useAction } from "@/lib/use-action";

export function DemoLogins() {
  const t = useTranslations("auth.demo");
  const tr = useTranslations("roles");
  const router = useRouter();
  const { pending, run } = useAction();

  return (
    <section className="mb-8">
      <h2 className="text-sm font-semibold">{t("title")}</h2>
      <ul className="mt-3 grid gap-2">
        {DEMO_ACCOUNTS.map(({ role, email }) => (
          <li key={role}>
            <button type="button" disabled={pending}
              onClick={() => run(() => signInAction({ email, password: DEMO_PASSWORD }), { onSuccess: (to) => { router.push(to); router.refresh(); } })}
              className="flex w-full flex-col items-start rounded-2xl border px-4 py-3 text-start hover:border-primary/50 hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-50">
              <span className="font-semibold">{tr(role)}</span>
              <span className="text-sm text-muted-foreground">{t(role)}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-6 border-t pt-6 text-sm text-muted-foreground">{t("or")}</p>
    </section>
  );
}
