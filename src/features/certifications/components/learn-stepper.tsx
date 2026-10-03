"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, HeartHandshake, PartyPopper, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { submitQuizAction, type QuizResult } from "@/features/certifications/actions";
import type { Lesson, QuizQuestion } from "@/features/certifications/queries";
import { useAction } from "@/lib/use-action";

export function LearnStepper({ slug, title, lessons, quiz, passScore }: {
  slug: string;
  title: string;
  lessons: Lesson[];
  quiz: QuizQuestion[];
  passScore: number;
}) {
  const t = useTranslations("learn");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => quiz.map(() => null));
  const [result, setResult] = useState<QuizResult | null>(null);
  const { pending, run } = useAction();
  const onQuiz = step === lessons.length;

  if (result) {
    return (
      <Card className="text-center">
        <CardContent className="flex flex-col items-center gap-4 py-6">
          {result.passed ? (
            <>
              <div className="rounded-full bg-accent/20 p-5 text-accent-foreground"><PartyPopper className="size-10" /></div>
              <h2 className="text-2xl font-semibold">{t("passedTitle")}</h2>
              <p className="flex items-center gap-2 rounded-full bg-accent/15 px-4 py-2 font-semibold"><HeartHandshake className="size-5" />{t("badgeEarned", { title })}</p>
            </>
          ) : (
            <h2 className="text-2xl font-semibold">{t("failedTitle")}</h2>
          )}
          <p className="text-muted-foreground">{t("score", { score: result.score, total: result.total, pass: passScore })}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {!result.passed && (
              <Button variant="outline" onClick={() => { setResult(null); setStep(0); setAnswers(quiz.map(() => null)); }}>
                <RotateCcw />{t("retry")}
              </Button>
            )}
            <Button asChild><Link href="/profile">{t("seeProfile")}</Link></Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Progress value={(step / lessons.length) * 100} className="flex-1" />
        <span className="text-sm text-muted-foreground">{onQuiz ? t("quiz") : t("lessonOf", { n: step + 1, total: lessons.length })}</span>
      </div>

      {onQuiz ? (
        <Card>
          <CardHeader><CardTitle>{t("quizTitle")}</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-6">
            {quiz.map((q, qi) => (
              <fieldset key={qi} className="grid gap-2">
                <legend className="mb-2 font-medium">{qi + 1}. {q.question}</legend>
                <RadioGroup value={answers[qi]?.toString() ?? ""} onValueChange={(v) => setAnswers((a) => a.map((x, i) => (i === qi ? Number(v) : x)))}>
                  {q.options.map((option, oi) => (
                    <Label key={oi} htmlFor={`q${qi}o${oi}`} className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 font-normal has-data-[state=checked]:border-primary has-data-[state=checked]:bg-secondary">
                      <RadioGroupItem id={`q${qi}o${oi}`} value={oi.toString()} />
                      {option}
                    </Label>
                  ))}
                </RadioGroup>
              </fieldset>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader><CardTitle>{lessons[step].title}</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3 leading-relaxed">
            {lessons[step].body.map((p, i) => <p key={i}>{p}</p>)}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between gap-2">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}><ArrowLeft />{t("previous")}</Button>
        {onQuiz ? (
          <Button disabled={pending || answers.some((a) => a === null)}
            onClick={() => run(() => submitQuizAction({ slug, answers: answers.map((a) => a ?? -1) }), { onSuccess: setResult })}>
            {t("submit")}
          </Button>
        ) : (
          <Button onClick={() => setStep((s) => s + 1)}>{step === lessons.length - 1 ? t("startQuiz") : t("next")}<ArrowRight /></Button>
        )}
      </div>
    </div>
  );
}
