import { Skeleton } from "@/components/ui/skeleton"

export function AboutSkeleton() {
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
        <div className="max-w-4xl mx-auto px-4 md:px-8 pt-20 md:pt-28 pb-16 md:pb-20 text-center space-y-6">
          <Skeleton className="h-5 w-24 mx-auto" />
          <Skeleton className="h-12 md:h-16 w-3/4 mx-auto" />
          <Skeleton className="h-5 w-2/3 mx-auto" />
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8 pb-24 space-y-24">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="w-full md:w-80 h-60 rounded-2xl" />
          </div>

          <div className="space-y-8">
            <div className="text-center space-y-4">
              <Skeleton className="h-5 w-32 mx-auto" />
              <Skeleton className="h-8 w-64 mx-auto" />
              <Skeleton className="h-4 w-96 mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-8 space-y-4 text-center">
                  <Skeleton className="w-16 h-16 rounded-2xl mx-auto" />
                  <Skeleton className="h-5 w-24 mx-auto" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="text-center space-y-4">
              <Skeleton className="h-5 w-32 mx-auto" />
              <Skeleton className="h-8 w-64 mx-auto" />
              <Skeleton className="h-4 w-96 mx-auto" />
            </div>
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                  <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-foreground dark:bg-card rounded-2xl p-12 md:p-16 text-center space-y-6">
            <Skeleton className="h-8 w-64 mx-auto bg-background/20 dark:bg-muted" />
            <Skeleton className="h-4 w-96 mx-auto bg-background/20 dark:bg-muted" />
            <Skeleton className="h-12 w-40 rounded-xl mx-auto bg-background/20 dark:bg-muted" />
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
