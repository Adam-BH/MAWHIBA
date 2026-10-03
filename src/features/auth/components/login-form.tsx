"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/shared/submit-button";
import { FieldError } from "@/components/shared/field-error";
import { signInAction } from "@/features/auth/actions";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { useAction } from "@/lib/use-action";

export function LoginForm({ next }: { next?: string }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const { pending, run } = useAction();
  const form = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((values) =>
    run(() => signInAction(values, next), {
      onSuccess: (to) => {
        router.push(to);
        router.refresh();
      },
    }),
  );

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="email">{t("email")}</Label>
        <Input id="email" type="email" autoComplete="email" {...form.register("email")} aria-invalid={!!errors.email} />
        <FieldError message={errors.email?.message} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">{t("password")}</Label>
        <Input id="password" type="password" autoComplete="current-password" {...form.register("password")} aria-invalid={!!errors.password} />
        <FieldError message={errors.password?.message} />
      </div>
      <SubmitButton pending={pending} size="lg">{t("loginCta")}</SubmitButton>
      <p className="text-center text-sm text-muted-foreground">
        {t("noAccount")}{" "}
        <Link className="font-medium text-primary underline" href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"}>{t("signupCta")}</Link>
      </p>
    </form>
  );
}
