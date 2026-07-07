import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl transition-colors text-slate-600 cursor-pointer group"
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 group-hover:scale-110 transition-transform" />
      ) : (
        <Sun className="w-5 h-5 group-hover:scale-110 transition-transform" />
      )}
    </button>
  );
}
