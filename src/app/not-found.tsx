import Link from "next/link";
import { Compass } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <Compass className="size-12 text-primary" />
      <h1 className="text-3xl font-semibold">{t("title")}</h1>
      <p className="max-w-md text-muted-foreground">{t("text")}</p>
      <Button asChild><Link href="/">{t("home")}</Link></Button>
    </div>
  );
}
