import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Copy, Trash2 } from "lucide-react";
import { useTasks, type TaskTemplate } from "@/hooks/useTasks";
import { toast } from "sonner";

interface TaskTemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskTemplatesDialog({ open, onOpenChange }: TaskTemplatesDialogProps) {
  const { templates, fetchTemplates, deleteTemplate, applyTemplate } = useTasks();

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open, fetchTemplates]);

  const handleApply = async (template: TaskTemplate) => {
    const task = await applyTemplate(template.id);
    if (task) {
      toast.success(`Task created from "${template.name}"`);
      onOpenChange(false);
    } else {
      toast.error("Failed to create task from template");
    }
  };

  const handleDelete = async (template: TaskTemplate) => {
    const success = await deleteTemplate(template.id);
    if (success) {
      toast.success(`Template "${template.name}" deleted`);
    } else {
      toast.error("Failed to delete template");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-['Spline_Sans',sans-serif] text-lg">Task Templates</DialogTitle>
          <DialogDescription>Create tasks from saved templates.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-2">
          {templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                <FileText className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-medium">No templates yet</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                Create a task and save it as a template to reuse later.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#f5f3ff] dark:bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-['Inter',sans-serif] text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {template.name}
                    </h4>
                    {template.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {template.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                        Task: {template.task_title}
                      </span>
                      {template.task_priority !== "none" && (
                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 capitalize">
                          {template.task_priority}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10"
                      onClick={() => handleApply(template)}
                      title="Create task from template"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-8 w-8 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => handleDelete(template)}
                      title="Delete template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="h-9 px-4 rounded-lg text-slate-500"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
