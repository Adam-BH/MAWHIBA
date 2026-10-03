import { cn } from "@/lib/utils";

type Line = { label: React.ReactNode; value: React.ReactNode };

/** Money breakdown read like a till receipt: lines, a rule, then the total. */
export function Receipt({ lines, total, className }: { lines: Line[]; total: Line; className?: string }) {
  return (
    <dl className={cn("grid gap-2 text-sm", className)}>
      {lines.map((line, i) => (
        <div key={i} className="flex items-baseline justify-between gap-4">
          <dt className="text-muted-foreground">{line.label}</dt>
          <dd className="font-semibold">{line.value}</dd>
        </div>
      ))}
      <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-dashed border-foreground/25 pt-3">
        <dt className="font-semibold">{total.label}</dt>
        <dd className="font-display text-2xl font-semibold">{total.value}</dd>
      </div>
    </dl>
  );
}
