import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, Tag, Calendar, Plus, Sparkles, CheckSquare } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateGoalModalProps {
  children: React.ReactNode;
  onCreate: (goal: { title: string; category: string; due_date: string | null; task_id: string | null }) => void;
  tasks: { id: string; title: string }[];
}

export function CreateGoalModal({ children, onCreate, tasks }: CreateGoalModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [taskId, setTaskId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onCreate({
      title,
      category: category || "General",
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      task_id: taskId,
    });
    
    setTitle("");
    setCategory("");
    setDueDate("");
    setTaskId(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none rounded-2xl shadow-2xl">
        <div className="bg-linear-to-br from-[#7c3aed] to-[#4f46e5] p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Target className="w-32 h-32 rotate-12" />
          </div>
          <DialogHeader className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/80 font-['Space_Grotesk',sans-serif] text-sm font-medium tracking-wider uppercase">New Milestone</span>
            </div>
            <DialogTitle className="font-['Spline_Sans',sans-serif] text-[32px] font-bold leading-tight text-white">
              Create New Goal
            </DialogTitle>
            <DialogDescription className="text-white/70 font-['Inter',sans-serif] text-base mt-2">
              Define your next big achievement and start tracking your progress.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-['Space_Grotesk',sans-serif] text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Target className="w-4 h-4 text-[#7c3aed]" />
              Goal Title
            </Label>
            <div className="relative">
              <Input
                id="title"
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
              <Label htmlFor="category" className="font-['Space_Grotesk',sans-serif] text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#7c3aed]" />
                Category
              </Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Work"
                className="h-12 rounded-xl border-slate-200 focus:border-[#7c3aed] focus:ring-[#7c3aed]/20 font-['Inter',sans-serif] text-slate-900 placeholder:text-slate-400 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="font-['Space_Grotesk',sans-serif] text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#7c3aed]" />
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-12 rounded-xl border-slate-200 focus:border-[#7c3aed] focus:ring-[#7c3aed]/20 font-['Inter',sans-serif] text-slate-900 transition-all"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="task" className="font-['Space_Grotesk',sans-serif] text-sm font-semibold text-slate-700 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#7c3aed]" />
              Related Task
            </Label>
            <Select value={taskId || "none"} onValueChange={(val) => setTaskId(val === "none" ? null : val)}>
              <SelectTrigger className="h-12 rounded-xl border-slate-200 focus:border-[#7c3aed] focus:ring-[#7c3aed]/20">
                <SelectValue placeholder="Select a task..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No task</SelectItem>
                {tasks?.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setOpen(false)}
              className="h-12 px-6 rounded-xl font-['Space_Grotesk',sans-serif] font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span className="font-['Space_Grotesk',sans-serif] font-bold tracking-wide uppercase text-xs">Create Goal</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
