import { Skeleton } from "@/components/ui/skeleton"

export function HomeSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="backdrop-blur-md bg-background/80 border-b border-border sticky top-0 z-50 w-full flex justify-center">
        <div className="max-w-7xl w-full flex items-center justify-between px-4 md:px-8 py-3 md:py-5">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-lg" />
            <Skeleton className="h-7 w-20" />
          </div>
          <div className="hidden md:flex items-center gap-5">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="hidden md:flex items-center gap-5">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-11 w-32 rounded-md" />
          </div>
          <Skeleton className="md:hidden h-10 w-10 rounded-xl" />
        </div>
      </div>

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-20 md:pt-32 pb-16 md:pb-24">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="flex-1 space-y-6">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-14 md:h-16 w-full max-w-2xl" />
              <Skeleton className="h-6 w-3/4" />
              <div className="flex gap-4 pt-4">
                <Skeleton className="h-12 w-44 rounded-xl" />
                <Skeleton className="h-12 w-40 rounded-xl" />
              </div>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="w-10 h-10 rounded-full border-2 border-background" />
                  ))}
                </div>
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <Skeleton className="w-full lg:w-[600px] h-[400px] lg:h-[500px] rounded-2xl" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-24">
          <div className="text-center space-y-4 mb-16">
            <Skeleton className="h-5 w-32 mx-auto" />
            <Skeleton className="h-10 w-96 mx-auto" />
            <Skeleton className="h-5 w-64 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-6 space-y-4">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-48" />
            </div>
            {[1, 2, 3].map((col) => (
              <div key={col} className="space-y-3">
                <Skeleton className="h-5 w-24" />
                {[1, 2, 3, 4].map((row) => (
                  <Skeleton key={row} className="h-4 w-28" />
                ))}
              </div>
            ))}
          </div>
          <Skeleton className="h-px w-full my-8" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-40" />
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="w-5 h-5 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
