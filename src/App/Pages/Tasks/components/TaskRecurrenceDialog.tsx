import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";

interface TaskRecurrenceDialogProps {
  taskId: string;
  currentRule: string | null | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (taskId: string, rule: string | null, endDate?: string | null) => Promise<boolean>;
}

const RECURRENCE_OPTIONS = [
  { value: null, label: "Does not repeat", description: "One-time task" },
  { value: "daily", label: "Daily", description: "Repeats every day" },
  { value: "weekly", label: "Weekly", description: "Repeats every week" },
  { value: "monthly", label: "Monthly", description: "Repeats every month" },
] as const;

export function TaskRecurrenceDialog({ taskId, currentRule, open, onOpenChange, onSave }: TaskRecurrenceDialogProps) {
  const [selectedRule, setSelectedRule] = useState<string | null>(currentRule ?? null);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const success = await onSave(taskId, selectedRule, endDate?.toISOString() ?? null);
    setIsSaving(false);
    if (success) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onOpenChange(o); }}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-['Spline_Sans',sans-serif] text-lg">Set Recurrence</DialogTitle>
          <DialogDescription>Choose how often this task should repeat.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {RECURRENCE_OPTIONS.map((opt) => (
            <button
              key={opt.value ?? "none"}
              onClick={() => setSelectedRule(opt.value)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                selectedRule === opt.value
                  ? "border-primary bg-[#f5f3ff] dark:bg-primary/10"
                  : "border-slate-200 hover:border-primary/50 dark:border-slate-700 dark:hover:border-primary/50",
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                selectedRule === opt.value
                  ? "border-primary"
                  : "border-slate-300 dark:border-slate-600",
              )}>
                {selectedRule === opt.value && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                )}
              </div>
              <div className="flex flex-col">
                <span className={cn(
                  "text-sm font-medium",
                  selectedRule === opt.value
                    ? "text-primary"
                    : "text-slate-700 dark:text-slate-300",
                )}>
                  {opt.label}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">{opt.description}</span>
              </div>
            </button>
          ))}

          {selectedRule && (
            <div className="pt-2">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight ml-1">
                End Date (optional)
              </label>
              <div className="mt-1.5">
                <DatePicker
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="No end date"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="h-9 px-4 rounded-lg text-slate-500"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="h-9 px-5 rounded-lg bg-primary hover:opacity-90 text-white"
          >
            <Repeat className="w-4 h-4 mr-1" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
