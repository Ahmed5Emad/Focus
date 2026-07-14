import { Skeleton } from "@/components/ui/skeleton"

export function NotFoundSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-8 space-y-4">
        <Skeleton className="h-32 w-48 mx-auto" />
        <Skeleton className="h-7 w-48 mx-auto" />
        <Skeleton className="h-4 w-72 mx-auto" />
        <Skeleton className="h-11 w-44 rounded-lg mx-auto" />
      </div>
    </div>
  )
}
