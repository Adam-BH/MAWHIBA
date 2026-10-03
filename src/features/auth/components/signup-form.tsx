"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dumbbell, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FieldError } from "@/components/shared/field-error";
import { SubmitButton } from "@/components/shared/submit-button";
import { signUpAction } from "@/features/auth/actions";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import { useAction } from "@/lib/use-action";

export function SignupForm({ next, defaultRole }: { next?: string; defaultRole: SignupInput["role"] }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const { pending, run } = useAction();
  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "", role: defaultRole },
  });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((values) =>
    run(() => signUpAction(values, next), {
      success: t("welcome"),
      onSuccess: (to) => {
        router.push(to);
        router.refresh();
      },
    }),
  );

  const roles = [
    { value: "client", label: t("roleClient"), icon: UserRound },
    { value: "coach", label: t("roleCoach"), icon: Dumbbell },
  ] as const;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <Controller control={form.control} name="role" render={({ field }) => (
        <RadioGroup value={field.value} onValueChange={field.onChange} className="grid grid-cols-2 gap-3">
          {roles.map(({ value, label, icon: Icon }) => (
            <Label key={value} htmlFor={`role-${value}`}
              className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 p-4 text-center has-data-[state=checked]:border-primary has-data-[state=checked]:bg-secondary">
              <RadioGroupItem id={`role-${value}`} value={value} className="sr-only" />
              <Icon className="size-6 text-primary" />
              <span className="text-sm font-medium">{label}</span>
            </Label>
          ))}
        </RadioGroup>
      )} />
      <div className="grid gap-2">
        <Label htmlFor="fullName">{t("fullName")}</Label>
        <Input id="fullName" autoComplete="name" {...form.register("fullName")} aria-invalid={!!errors.fullName} />
        <FieldError message={errors.fullName?.message} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">{t("email")}</Label>
        <Input id="email" type="email" autoComplete="email" {...form.register("email")} aria-invalid={!!errors.email} />
        <FieldError message={errors.email?.message} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">{t("password")}</Label>
        <Input id="password" type="password" autoComplete="new-password" {...form.register("password")} aria-invalid={!!errors.password} />
        <FieldError message={errors.password?.message ?? undefined} />
        <p className="text-xs text-muted-foreground">{t("passwordHint")}</p>
      </div>
      <SubmitButton pending={pending} size="lg">{t("signupCta")}</SubmitButton>
      <p className="text-center text-sm text-muted-foreground">
        {t("haveAccount")}{" "}
        <Link className="font-medium text-primary underline" href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}>{t("loginCta")}</Link>
      </p>
    </form>
  );
}
