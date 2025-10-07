import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-4 md:p-8 space-y-8">
      <header>
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-80 mt-2" />
      </header>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-[108px] w-full" />
        <Skeleton className="h-[108px] w-full" />
        <Skeleton className="h-[108px] w-full" />
      </div>
      <div>
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
