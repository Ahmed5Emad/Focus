import React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeaturesCardProps extends React.ComponentProps<"div"> {
  icon: LucideIcon;
  head: string;
  description: string;
  iconColorClass?: string;
  iconBgClass?: string;
}

export function FeaturesCard({
  className,
  icon: Icon,
  head,
  description,
  iconColorClass = "text-primary",
  iconBgClass = "bg-white",
  ...props
}: FeaturesCardProps) {

  return (
    <div 
      className={cn(
        "flex flex-col gap-4 p-8 bg-card text-card-foreground transition-all hover:bg-gray-50/50", 
        className
      )} 
      {...props}
    >
      <div className={cn("flex h-12 w-12 border border-gray-100 items-center shadow-[0_1px_2px_rgba(0,0,0,0.05)] justify-center rounded-lg", iconBgClass, iconColorClass)}>
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
