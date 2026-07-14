import { Skeleton } from "@/components/ui/skeleton"

export function FeaturedSkeleton() {
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
        {[1, 2, 3, 4, 5, 6].map((section) => (
          <div key={section} className={section % 2 === 0 ? "bg-muted/50" : ""}>
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-20 md:py-28">
              <div className={`flex flex-col ${section % 2 === 0 ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12 lg:gap-16`}>
                <div className="flex-1 space-y-6">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-10 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <div className="flex flex-wrap gap-3 pt-2">
                    {[1, 2, 3].map((t) => (
                      <Skeleton key={t} className="h-6 w-20 rounded-full" />
                    ))}
                  </div>
                </div>
                <Skeleton className="w-full lg:w-[500px] h-[350px] rounded-2xl" />
              </div>
            </div>
          </div>
        ))}

        <div className="max-w-6xl mx-auto px-4 md:px-8 pb-24">
          <div className="text-center space-y-4 mb-16">
            <Skeleton className="h-5 w-32 mx-auto" />
            <Skeleton className="h-10 w-64 mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="bg-card border border-border rounded-xl p-8 space-y-4">
                <Skeleton className="w-14 h-14 rounded-xl" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-foreground dark:bg-card py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
            <Skeleton className="h-10 w-80 mx-auto bg-background/20 dark:bg-muted" />
            <Skeleton className="h-5 w-96 mx-auto bg-background/20 dark:bg-muted" />
            <div className="flex justify-center gap-4 pt-4">
              <Skeleton className="h-12 w-40 rounded-xl bg-background/20 dark:bg-muted" />
              <Skeleton className="h-12 w-40 rounded-xl bg-background/20 dark:bg-muted" />
            </div>
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
