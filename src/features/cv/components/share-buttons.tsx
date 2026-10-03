"use client";

import { Link2, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ShareButtons({ url, text }: { url: string; text: string }) {
  const t = useTranslations("share");
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("copied"));
    } catch {
      toast.error(t("copyFailed"));
    }
  }
  return (
    <>
      <Button type="button" variant="outline" onClick={copy}><Link2 />{t("copy")}</Button>
      <Button asChild variant="outline">
        <a href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`} target="_blank" rel="noreferrer"><MessageCircle />{t("whatsapp")}</a>
      </Button>
    </>
  );
}
