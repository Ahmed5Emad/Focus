import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  iconGradientFrom?: string;
  iconGradientTo?: string;
  blurColor?: string;
  iconColor?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  iconGradientFrom = "#f5f3ff",
  iconGradientTo = "#ede9fe",
  blurColor = "#7b68ee",
  iconColor = "#7b68ee",
  children,
}: EmptyStateProps) {
  return (
    <div className="col-span-1 md:col-span-12 flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: blurColor }} />
        <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: blurColor }} />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-sm rotate-3 group-hover:rotate-0 transition-transform duration-500" style={{ background: `linear-gradient(135deg, ${iconGradientFrom}, ${iconGradientTo})` }}>
          <Icon className="w-12 h-12" style={{ color: iconColor }} />
        </div>

        <h2 className="font-['Spline_Sans',sans-serif] text-[32px] md:text-[40px] leading-tight font-bold text-slate-900 mb-4 tracking-tight">
          {title}
        </h2>

        <p className="font-['Inter',sans-serif] text-[18px] leading-relaxed text-slate-600 max-w-lg mb-10">
          {description}
        </p>

        {children ?? (action && (action.href ? (
          <Link to={action.href}>
            <Button className={cn("btn-primary", action.href ? "w-fit" : "")}>
              {action.label}
            </Button>
          </Link>
        ) : (
          <Button className="btn-primary" onClick={action.onClick}>
            {action.label}
          </Button>
        )))}
      </div>
    </div>
  );
}
