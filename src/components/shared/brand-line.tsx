import { cn } from "@/lib/utils";

/** The logo's running stroke as a single thin curve. Decorative: use rarely. */
export function BrandLine({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 40" fill="none" aria-hidden className={cn("h-auto", className)}>
      <path d="M2 32c28 0 44-24 78-24 30 0 46 22 80 22 26 0 44-12 62-22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="231" cy="5" r="3.5" fill="currentColor" />
    </svg>
  );
}
