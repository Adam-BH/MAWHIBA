import { BrandLine } from "@/components/shared/brand-line";

/** One short sentence and at most one action. */
export function EmptyState({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed px-6 py-10 text-center">
      <BrandLine className="w-20 text-primary/30" />
      <p className="max-w-sm text-muted-foreground">{title}</p>
      {action}
    </div>
  );
}
