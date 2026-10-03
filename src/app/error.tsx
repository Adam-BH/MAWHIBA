"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("errorPage");
  useEffect(() => console.error(error), [error]);
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-4 text-center">
      <TriangleAlert className="size-12 text-warning" />
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="max-w-md text-muted-foreground">{t("text")}</p>
      <Button onClick={reset}>{t("retry")}</Button>
    </div>
  );
}
