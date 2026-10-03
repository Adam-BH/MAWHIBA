import { notFound } from "next/navigation";
import { CalendarX, Coins, ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { CoachBadges } from "@/components/shared/coach-badges";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Points } from "@/components/shared/points";
import { RatingStars } from "@/components/shared/rating-stars";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { BudgetRange } from "@/components/shared/budget-range";
import { AthleteCard } from "@/components/shared/athlete-card";
import { LevelChip } from "@/components/shared/level-chip";
import { StrengthMeter } from "@/features/profile/components/strength-meter";
import { ACHIEVEMENT_LEVELS } from "@/lib/config";
import { TimeLeft } from "@/components/shared/time-left";
import { OfferCard } from "@/features/offers/components/offer-card";
import { ProposalCard } from "@/features/proposals/components/proposal-card";
import { RequestCard } from "@/features/requests/components/request-card";

const TOKENS = [
  "background", "foreground", "primary", "primary-foreground", "secondary", "accent", "muted",
  "muted-foreground", "success", "warning", "destructive", "border", "input", "ring",
];
const STATUSES = ["pending", "confirmed", "completed", "declined", "cancelled", "paid", "rejected", "open", "fulfilled", "closed", "expired", "accepted", "withdrawn"] as const;
const IN_5_DAYS = new Date(Date.now() + 5 * 86_400_000).toISOString();
const CARD = {
  name: "Amira Ben Salah", avatarUrl: null, sport: "Natation", city: "La Marsa", level: "international" as const, verified: true,
  rating: 4.9, ratingCount: 32, sessions: 32, years: 12, badges: ["verified", "inclusive", "complete"] as const, tagline: "Je rends l'eau rassurante pour tous",
};
const SLOT = { starts_at: IN_5_DAYS, ends_at: IN_5_DAYS, location: "Piscine olympique de Radès" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default async function DevUiPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  const t = await getTranslations("devUi");

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-10">
      <PageHeader title={t("title")} description={t("subtitle")} />
      <Section title={t("tokens")}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {TOKENS.map((token) => (
            <div key={token} className="flex flex-col gap-1 text-xs">
              <div className="h-14 rounded-lg border" style={{ background: `var(--${token})` }} />
              <code>--{token}</code>
            </div>
          ))}
        </div>
        <p className="font-display text-2xl font-semibold">--font-display · MAWHIBA</p>
        <p className="font-sans">--font-sans · {t("sample")}</p>
      </Section>
      <Section title={t("buttons")}>
        <div className="flex flex-wrap gap-2">
          {(["default", "secondary", "outline", "ghost", "destructive", "link"] as const).map((v) => <Button key={v} variant={v}>{v}</Button>)}
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">accent</Button>
          <Button disabled>disabled</Button>
        </div>
      </Section>
      <Section title={t("badges")}>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => <StatusBadge key={s} status={s} />)}
          <Badge>default</Badge><Badge variant="secondary">secondary</Badge><Badge variant="outline">outline</Badge>
        </div>
        <CoachBadges verified inclusive />
        <div className="flex flex-wrap items-center gap-4">
          <RatingStars rating={4.6} count={23} /><Points value={47} /><Points value={38} signed className="text-success" />
          <UserAvatar name="Amira Ben Salah" />
        </div>
      </Section>
      <Section title={t("cards")}>
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard icon={Coins} label="primary" value={<Points value={110} />} />
          <StatCard icon={Coins} tone="accent" label="accent" value={42} />
          <StatCard icon={ShieldCheck} tone="success" label="success" value={7} hint="hint" />
        </div>
        <Card>
          <CardHeader><CardTitle>Card</CardTitle><CardDescription>{t("sample")}</CardDescription></CardHeader>
          <CardContent><Progress value={60} /></CardContent>
        </Card>
        <Alert><ShieldCheck /><AlertTitle>Alert</AlertTitle><AlertDescription>{t("sample")}</AlertDescription></Alert>
        <Alert variant="destructive"><ShieldCheck /><AlertTitle>Destructive</AlertTitle><AlertDescription>{t("sample")}</AlertDescription></Alert>
        <EmptyState icon={CalendarX} title="EmptyState" description={t("sample")} />
      </Section>
      <Section title={t("marketplace")}>
        <div className="flex flex-wrap items-center gap-4"><BudgetRange min={30} max={50} /><TimeLeft expiresAt={IN_5_DAYS} /></div>
        <div className="grid gap-3 md:grid-cols-2">
          <OfferCard offer={{ title: "Natation enfants", sport: "Natation", description: "Premières nages.", duration_min: 45, price: 40, audience: "enfants", is_inclusive: false }} />
          <OfferCard selected offer={{ title: "Séance inclusive", sport: "Natation", description: "", duration_min: 60, price: 50, audience: "tous", is_inclusive: true }} />
          <RequestCard request={{ sport: "Natation", city: "La Marsa", title: "Coach pour mon fils (8 ans)", audience: "enfant", child_age: 8, level: "debutant",
            special_needs: true, schedule_note: "Samedi matin", budget_min: 30, budget_max: 50, status: "open", expires_at: IN_5_DAYS, client_first_name: "Mehdi", proposals_count: 2 }} />
          <ProposalCard budget={{ min: 30, max: 50 }} proposal={{ price: 60, message: "Disponible samedi.", status: "pending", slot: SLOT }} />
        </div>
      </Section>
      <Section title={t("profileCv")}>
        <div className="flex flex-wrap gap-2">{ACHIEVEMENT_LEVELS.map((l) => <LevelChip key={l} level={l} />)}</div>
        <StrengthMeter score={72} level="pro" next={{ key: "achievements", gain: 10, count: 2 }} />
        <div className="grid gap-4 md:grid-cols-2">
          <AthleteCard card={{ ...CARD, badges: [...CARD.badges] }} />
          <AthleteCard variant="compact" card={{ ...CARD, sport: "Boxe", badges: ["verified"] }} />
        </div>
      </Section>
      <Section title={t("forms")}>
        <div className="grid max-w-md gap-3">
          <Label htmlFor="dev-input">Input</Label>
          <Input id="dev-input" placeholder="placeholder" />
          <Input aria-invalid placeholder="aria-invalid" />
          <Textarea placeholder="Textarea" />
          <Label className="flex items-center gap-2"><Checkbox defaultChecked />Checkbox</Label>
          <Skeleton className="h-8" />
        </div>
      </Section>
    </main>
  );
}
