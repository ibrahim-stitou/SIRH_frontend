import { Skeleton } from "@/components/ui/skeleton";

export function PosteInfoCardSkeleton() {
  return (
    <div className="rounded-xl border bg-white p-6 space-y-5">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>

        <Skeleton className="h-9 w-40" />
      </div>

      <Skeleton className="h-px w-full" />

      {/* Details */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-lg bg-slate-50 p-4 space-y-2"
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}
