import { Skeleton } from "@/components/ui/skeleton"

export function SignUpSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cu-purple/5 via-background to-cu-orange/5 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-sm w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-3">
          <Skeleton className="w-12 h-12 rounded-xl mx-auto" />
          <Skeleton className="h-7 w-40 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-px flex-1" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-px flex-1" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-11 flex-1 rounded-lg" />
            <Skeleton className="h-11 flex-1 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-4 w-56 mx-auto" />
      </div>
    </div>
  )
}
