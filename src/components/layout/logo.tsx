import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("font-display text-xl font-semibold tracking-tight text-primary", className)}>
      MAWHIBA<span className="text-accent">.</span>
    </Link>
  );
}
