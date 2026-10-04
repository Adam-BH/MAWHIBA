import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, initials } from "@/lib/utils";

export function UserAvatar({ name, src, className }: { name: string; src?: string | null; className?: string }) {
  return (
    <Avatar className={cn("size-10", className)}>
      {src && <AvatarImage src={src} alt={name} />}
      <AvatarFallback className="bg-secondary text-primary font-semibold">{initials(name) || "?"}</AvatarFallback>
    </Avatar>
  );
}
