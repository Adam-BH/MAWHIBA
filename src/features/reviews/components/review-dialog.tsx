"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/shared/submit-button";
import { createReviewAction } from "@/features/reviews/actions";
import { cn } from "@/lib/utils";
import { useAction } from "@/lib/use-action";

export function ReviewDialog({ bookingId, coachName }: { bookingId: string; coachName: string }) {
  const t = useTranslations("reviews");
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const { pending, run } = useAction();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    run(() => createReviewAction({ bookingId, rating, comment }), { success: t("thanks"), onSuccess: () => setOpen(false) });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90"><Star />{t("leave")}</Button></DialogTrigger>
      <DialogContent>
        <form onSubmit={submit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t("subtitle", { name: coachName })}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-1" role="radiogroup" aria-label={t("rating")}>
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} type="button" role="radio" aria-checked={rating === i} aria-label={t("stars", { count: i })} onClick={() => setRating(i)}>
                <Star className={cn("size-9", i <= rating ? "fill-accent text-accent" : "text-border")} />
              </button>
            ))}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="comment">{t("comment")}</Label>
            <Textarea id="comment" rows={3} maxLength={1000} value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t("commentPlaceholder")} />
          </div>
          <DialogFooter><SubmitButton pending={pending}>{t("submit")}</SubmitButton></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
