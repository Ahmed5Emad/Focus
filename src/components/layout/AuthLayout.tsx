import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.svg";
import { FieldDescription } from "@/components/ui/field";

interface AuthLayoutProps extends React.ComponentProps<"div"> {
  title: string;
  description: React.ReactNode;
  children: React.ReactNode;
}

export function AuthLayout({
  className,
  title,
  description,
  children,
  ...props
}: AuthLayoutProps) {
  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center bg-gradient-to-br from-cu-purple/5 via-white to-cu-orange/5 p-4",
        className,
      )}
      {...props}
    >
      <div className="w-full max-w-md flex flex-col gap-6 bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 sm:p-10 relative overflow-hidden">
        <div className="flex flex-col items-center gap-2 text-center mb-4">
          <Link
            to="/"
            className="flex flex-col items-center gap-2 font-medium group"
          >
            <div className="flex flex-col items-center justify-center group-hover:scale-105 transition-transform">
              <img src={logo} alt="logo" className="w-12" />
            </div>
            <h2 className="text-3xl font-black text-slate-900">Focus</h2>
            <span className="sr-only">Focus</span>
          </Link>
          <h1 className="text-2xl font-bold mt-2 text-slate-900">{title}</h1>
          <FieldDescription className="text-base mt-1">
            {description}
          </FieldDescription>
        </div>
        {children}
        <FieldDescription className="px-6 text-center mt-2 text-sm text-gray-500">
          By clicking continue, you agree to our{" "}
          <a href="#" className="font-medium text-slate-700 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="font-medium text-slate-700 hover:underline">
            Privacy Policy
          </a>
          .
        </FieldDescription>
      </div>
    </div>
  );
}
