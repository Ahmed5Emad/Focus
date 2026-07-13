import { useEffect, useCallback } from "react";
import { X } from "lucide-react";

interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcuts = [
  { keys: ["Cmd/Ctrl + K"], description: "Open command palette" },
  { keys: ["Cmd/Ctrl + D"], description: "Log distraction (active focus session)" },
  { keys: ["Cmd/Ctrl + B"], description: "Toggle sidebar" },
  { keys: ["?", "Cmd/Ctrl + /"], description: "Show this help modal" },
  { keys: ["N"], description: "New task" },
  { keys: ["G then D"], description: "Go to Dashboard" },
  { keys: ["G then T"], description: "Go to Tasks" },
  { keys: ["G then P"], description: "Go to Projects" },
  { keys: ["G then G"], description: "Go to Goals" },
  { keys: ["Escape"], description: "Close modal / Cancel" },
];

export function KeyboardShortcutsModal({ open, onOpenChange }: KeyboardShortcutsModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    },
    [onOpenChange]
  );

  useEffect(() => {
    if (open) {
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }
  }, [open, handleEscape]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-shortcuts-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
    >
      <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h3
            id="keyboard-shortcuts-title"
            className="font-['Spline_Sans',sans-serif] font-bold text-slate-900 dark:text-slate-100 text-base"
          >
            Keyboard Shortcuts
          </h3>
          <button
            onClick={() => onOpenChange(false)}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
            aria-label="Close keyboard shortcuts"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <th className="text-left pb-2 pr-4 font-medium w-[45%]">Shortcut</th>
                <th className="text-left pb-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {shortcuts.map((shortcut, i) => (
                <tr
                  key={i}
                  className="border-t border-slate-100 dark:border-slate-800"
                >
                  <td className="py-2.5 pr-4 align-top">
                    <div className="flex flex-wrap gap-1.5">
                      {shortcut.keys.map((key, j) => (
                        <kbd
                          key={j}
                          className="px-2 py-1 bg-white dark:bg-[#1a2332] border border-slate-200 dark:border-slate-600 rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 shadow-sm whitespace-nowrap"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 text-sm text-slate-600 dark:text-slate-400">
                    {shortcut.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
