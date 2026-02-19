import React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeaturesCardProps extends React.ComponentProps<"div"> {
  icon: LucideIcon;
  head: string;
  description: string;
}

export function FeaturesCard({
  className,
  icon: Icon,
  head,
  description,
  ...props
}: FeaturesCardProps) {

  return (
    <div 
      className={cn(
        "flex flex-col w-1/3 gap-4 p-6 rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md", 
        className
      )} 
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <div className="space-y-2">
        <h3 className="font-bold text-xl leading-none tracking-tight text-slate-900 dark:text-slate-100">
          {head}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
