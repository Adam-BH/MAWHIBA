import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Text wordmark placeholder.
 * TODO(brand): add the official files to public/brand/ (mark-lime.svg, logo-purple.svg, logo-on-lime.svg)
 * and render the running-figure mark before the wordmark. Do not redraw it here.
 */
export function Logo({ className, href = "/", tone = "brand" }: { className?: string; href?: string; tone?: "brand" | "onPrimary" }) {
  return (
    <Link href={href} aria-label="Mawhiba"
      className={cn("inline-flex w-fit flex-col items-start text-xl leading-none", tone === "onPrimary" ? "text-accent" : "text-primary", className)}>
      <span className="font-display font-semibold tracking-tight">mawhiba</span>
      <span lang="ar" className="text-[0.6em]">موهبة</span>
    </Link>
  );
}
