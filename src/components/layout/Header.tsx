import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import logo from "@/assets/logo.svg";
import { cn } from "@/lib/utils";

export function Header() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Features", path: "/features" },
    { name: "Pricing", path: "/pricing" },
    { name: "About", path: "/about" },
  ];

  return (
    <header className="backdrop-blur-md bg-white/80 border-b border-gray-100 sticky top-0 z-50 w-full flex justify-center">
      <div className="max-w-7xl w-full flex items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group py-3 md:py-5">
          <div className="w-8 h-8 md:w-10 md:h-10 group-hover:scale-105 transition-transform">
            <img src={logo} alt="Focus Logo" className="w-full h-full" />
          </div>
          <span className="font-black text-xl md:text-2xl text-slate-900 tracking-tight">Focus</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center h-full">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-base font-medium transition-colors h-full flex items-center px-3 md:px-5 py-3 md:py-5 border-b-2",
                isActive(link.path)
                  ? "text-slate-900 border-cu-purple"
                  : "text-slate-600 hover:text-slate-900 border-transparent hover:border-gray-200"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions (Desktop) & Mobile Trigger */}
        <div className="flex items-center gap-2 md:gap-5 py-3 md:py-5">
          <div className="hidden md:flex items-center gap-5">
            <Link to="/login" className="text-base font-medium text-slate-900 hover:text-slate-600 transition-colors">
              Login
            </Link>
            <Link to="/signup">
              <Button className="font-bold text-base h-11 px-6 bg-slate-900 text-white hover:bg-slate-800 rounded-md">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden w-10 h-10">
                <Menu className="w-6 h-6 text-slate-900" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-[360px] flex flex-col pt-16">
              <SheetTitle className="flex items-center gap-3 mb-8 px-6">
                <img src={logo} alt="Focus Logo" className="w-8 h-8" />
                <span className="font-black text-xl text-slate-900 tracking-tight">Focus</span>
              </SheetTitle>
              <nav className="flex flex-col gap-2 px-6 pb-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      "text-lg font-semibold py-3 px-4 rounded-lg transition-colors",
                      isActive(link.path) 
                        ? "text-cu-purple bg-cu-purple/5" 
                        : "text-slate-900 hover:text-cu-purple hover:bg-slate-50"
                    )}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
              <div className="flex flex-col gap-3 mt-auto pt-8 pb-8 px-6 border-t border-gray-100">
                <Link to="/login">
                  <Button variant="outline" className="w-full text-base font-bold h-12 rounded-xl text-slate-900 border-gray-200">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="w-full text-base font-bold bg-slate-900 text-white hover:bg-slate-800 h-12 rounded-xl">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}