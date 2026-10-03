import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/", tone = "brand" }: { className?: string; href?: string; tone?: "brand" | "onPrimary" }) {
  return (
    <Link href={href} className={cn("inline-flex h-9 w-fit", className)}>
      <Image src={tone === "onPrimary" ? "/brand/logo-lime.png" : "/brand/logo-purple.png"} alt="Mawhiba"
        width={3627} height={1324} priority className="h-full w-auto" />
    </Link>
  );
}
