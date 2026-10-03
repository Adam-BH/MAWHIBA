import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy>
      <Skeleton className="h-9 w-56 rounded-full" />
      <Skeleton className="h-5 w-80 max-w-full rounded-full" />
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-3xl" />)}
      </div>
      <Skeleton className="h-48 rounded-4xl" />
    </div>
  );
}
