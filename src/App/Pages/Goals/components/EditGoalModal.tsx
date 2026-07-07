import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, Tag, Calendar, Pencil } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import type { Goal } from "./GoalCard";

interface EditGoalModalProps {
  goal: Goal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, updates: Partial<Goal>) => void;
}

export function EditGoalModal({ goal, open, onOpenChange, onUpdate }: EditGoalModalProps) {
  const [title, setTitle] = useState(goal.title);
  const [category, setCategory] = useState(goal.category);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    goal.due_date ? new Date(goal.due_date) : undefined
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onUpdate(goal.id, {
      title,
      category: category || "General",
      due_date: dueDate ? dueDate.toISOString() : null,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none rounded-2xl shadow-2xl">
        <div className="bg-linear-to-br from-[#7c3aed] to-[#4f46e5] p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Target className="w-32 h-32 rotate-12" />
          </div>
          <DialogHeader className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Pencil className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/80 font-['Space_Grotesk',sans-serif] text-sm font-medium tracking-wider uppercase">Edit Milestone</span>
            </div>
            <DialogTitle className="font-['Spline_Sans',sans-serif] text-[32px] font-bold leading-tight text-white">
              Edit Goal
            </DialogTitle>
            <DialogDescription className="text-white/70 font-['Inter',sans-serif] text-base mt-2">
              Update your goal details and keep tracking your progress.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
          <div className="space-y-2">
            <Label htmlFor="edit-title" className="font-['Space_Grotesk',sans-serif] text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Target className="w-4 h-4 text-[#7c3aed]" />
              Goal Title
            </Label>
            <div className="relative">
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Launch SaaS Product"
                className="h-12 rounded-xl border-slate-200 focus:border-[#7c3aed] focus:ring-[#7c3aed]/20 font-['Inter',sans-serif] text-slate-900 placeholder:text-slate-400 transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category" className="font-['Space_Grotesk',sans-serif] text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#7c3aed]" />
                Category
              </Label>
              <Input
                id="edit-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Work"
                className="h-12 rounded-xl border-slate-200 focus:border-[#7c3aed] focus:ring-[#7c3aed]/20 font-['Inter',sans-serif] text-slate-900 placeholder:text-slate-400 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-['Space_Grotesk',sans-serif] text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#7c3aed]" />
                Due Date
              </Label>
              <DatePicker
                value={dueDate}
                onChange={setDueDate}
                placeholder="Pick a due date..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="h-12 px-6 rounded-xl font-['Space_Grotesk',sans-serif] font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-primary flex items-center gap-2"
            >
              <Pencil className="w-5 h-5" />
              <span className="font-['Space_Grotesk',sans-serif] font-bold tracking-wide uppercase text-xs">Save Changes</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
