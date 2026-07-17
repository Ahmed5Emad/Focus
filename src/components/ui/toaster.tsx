import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "@/hooks/useTheme";

export function Toaster() {
  const { theme } = useTheme();

  return (
    <SonnerToaster
      theme={theme}
      position="top-right"
      toastOptions={{
        className: "!bg-card !border-border !text-foreground shadow-lg",
      }}
    />
  );
}
