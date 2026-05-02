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
import { Tag, Layout, Plus, Sparkles, AlignLeft } from "lucide-react";

interface CreateProjectModalProps {
  children: React.ReactNode;
  onCreate: (project: { title: string; description: string; category: string }) => void;
}

export function CreateProjectModal({ children, onCreate }: CreateProjectModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onCreate({
      title,
      description,
      category: category || "General",
    });

    
    setTitle("");
    setDescription("");
    setCategory("");
    setOpen(false);
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none rounded-2xl shadow-2xl">
        <div className="bg-linear-to-br from-[#7b68ee] to-[#6d28d9] p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Layout className="w-32 h-32 rotate-12" />
          </div>
          <DialogHeader className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/80 font-['Space_Grotesk',sans-serif] text-sm font-medium tracking-wider uppercase">New Initiative</span>
            </div>
            <DialogTitle className="font-['Spline_Sans',sans-serif] text-[32px] font-bold leading-tight text-white">
              Create New Project
            </DialogTitle>
            <DialogDescription className="text-white/70 font-['Inter',sans-serif] text-base mt-2">
              Organize your work and collaborate with your team more effectively.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-['Space_Grotesk',sans-serif] text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Layout className="w-4 h-4 text-[#7b68ee]" />
              Project Title
            </Label>
            <div className="relative">
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Q3 Marketing Campaign"
                className="h-12 rounded-xl border-slate-200 focus:border-[#7b68ee] focus:ring-[#7b68ee]/20 font-['Inter',sans-serif] text-slate-900 placeholder:text-slate-400 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-['Space_Grotesk',sans-serif] text-sm font-semibold text-slate-700 flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-[#7b68ee]" />
              Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe the project goals..."
              className="h-12 rounded-xl border-slate-200 focus:border-[#7b68ee] focus:ring-[#7b68ee]/20 font-['Inter',sans-serif] text-slate-900 placeholder:text-slate-400 transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="font-['Space_Grotesk',sans-serif] text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#7b68ee]" />
              Category
            </Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Marketing, Development"
              className="h-12 rounded-xl border-slate-200 focus:border-[#7b68ee] focus:ring-[#7b68ee]/20 font-['Inter',sans-serif] text-slate-900 placeholder:text-slate-400 transition-all"
            />
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
              className="btn-primary"
            >
              <Plus className="w-5 h-5" />
              <span className="font-['Space_Grotesk',sans-serif] font-bold tracking-wide uppercase text-xs">Create Project</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
