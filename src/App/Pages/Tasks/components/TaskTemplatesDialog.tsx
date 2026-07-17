import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const { templates, fetchTemplates, deleteTemplate } = useTasks();
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open, fetchTemplates]);

  const handleApply = (template: TaskTemplate) => {
    onOpenChange(false);
    navigate("/tasks/new", {
      state: {
        templateTitle: template.task_title,
        templatePriority: template.task_priority,
        templateDescription: template.task_description,
        templateProjectId: template.project_id,
        templateDueDate: template.due_date,
      },
    });
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
      <DialogContent className="sm:max-w-lg max-w-[calc(100%-2rem)] rounded-xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-['Spline_Sans',sans-serif] text-lg">Task Templates</DialogTitle>
          <DialogDescription>Create tasks from saved templates.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-2">
          {templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <FileText className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">No templates yet</p>
              <p className="text-muted-foreground/60 text-sm mt-1">
                Create a task and save it as a template to reuse later.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-cu-purple/10 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-['Inter',sans-serif] text-sm font-semibold text-foreground truncate">
                      {template.name}
                    </h4>
                    {template.description && (
                      <p className="text-xs text-muted-foreground/70 mt-0.5 line-clamp-2">
                        {template.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-[10px] font-medium text-muted-foreground/60">
                        Task: {template.task_title}
                      </span>
                      {template.task_priority !== "none" && (
                        <span className="text-[10px] font-medium text-muted-foreground/60 capitalize">
                          {template.task_priority}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                      onClick={() => handleApply(template)}
                      title="Use template"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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

        <div className="flex justify-end pt-2 border-t border-border">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="h-9 px-4 rounded-lg text-muted-foreground"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
