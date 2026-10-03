import type { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title, description, action }: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-4xl border border-dashed border-primary/25 bg-card px-6 py-12 text-center animate-in fade-in-0 duration-300">
      <div className="rounded-full bg-secondary p-4 text-primary"><Icon className="size-6" /></div>
      <p className="font-display font-semibold">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}
