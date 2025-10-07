import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Loading() {
  return (
    <div className="p-4 md:p-8 space-y-8">
        <header className="flex items-center justify-between">
            <div>
                <Skeleton className="h-9 w-40" />
                <Skeleton className="h-5 w-64 mt-2" />
            </div>
            <div className="w-full max-w-sm">
                <Skeleton className="h-10 w-full" />
            </div>
        </header>

        <Skeleton className="h-[500px] w-full" />
    </div>
  );
}
