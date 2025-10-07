import { Church } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/admin" className={cn("flex items-center gap-2", className)}>
      <Church className="h-6 w-6 text-primary" />
      <h1 className="text-xl font-bold font-headline text-foreground tracking-tight">
        Connect & Grow
      </h1>
    </Link>
  );
}
