import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Loader2, User, Folder, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dropdown } from "@/components/shared/Dropdown";
import type { Task, MemberProfile, Project, Priority, WorkflowStatus } from "@/hooks/useTasks";
import { DatePicker } from "@/components/ui/date-picker";

const STATUS_OPTIONS = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

const defaultStatusColor = (s: string) => {
  switch (s) {
    case "todo": return "bg-slate-100 text-slate-600";
    case "in_progress": return "bg-blue-50 text-blue-600";
    case "done": return "bg-emerald-50 text-emerald-600";
    default: return "bg-slate-100 text-slate-600";
  }
};

interface TaskEditDialogProps {
  task: Task | null;
  projects: Project[];
  members: MemberProfile[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (taskId: string, updates: Partial<{ title: string; status: string; project_id: string | null; assignee_id: string | null; due_date: string | null; priority: Priority }>) => Promise<boolean>;
  workflowStatuses?: WorkflowStatus[];
}

export function TaskEditDialog({ task, projects, members, open, onOpenChange, onSave, workflowStatuses }: TaskEditDialogProps) {
  const statusOptions = workflowStatuses && workflowStatuses.length > 0
    ? workflowStatuses.map(s => ({ value: s.name, label: s.name }))
    : STATUS_OPTIONS;

  const getStatusColor = (statusName: string) => {
    if (workflowStatuses && workflowStatuses.length > 0) {
      const ws = workflowStatuses.find(s => s.name === statusName);
      if (ws) return { className: '', style: { backgroundColor: ws.color + '20', color: ws.color } };
    }
    const cls = defaultStatusColor(statusName);
    return { className: cls, style: {} };
  };
  const [title, setTitle] = useState(task?.title ?? "");
  const [status, setStatus] = useState(task?.status ?? "todo");
  const [projectId, setProjectId] = useState<string | null>(task?.project_id ?? null);
  const [assigneeId, setAssigneeId] = useState<string | null>(task?.assignee_id ?? null);
  const [priority, setPriority] = useState<Priority>(task?.priority ?? "none");
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task?.due_date ? new Date(task.due_date) : undefined
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!task || !title.trim() || isSaving) return;
    setIsSaving(true);
    const success = await onSave(task.id, {
      title: title.trim(),
      status,
      project_id: projectId,
      assignee_id: assigneeId,
      priority,
      due_date: dueDate?.toISOString() ?? null,
    });
    setIsSaving(false);
    if (success) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent key={task?.id ?? "new"} className="sm:max-w-lg rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-['Spline_Sans',sans-serif] text-lg">Edit Task</DialogTitle>
          <DialogDescription>Update the task details below.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 outline-none transition-all text-slate-700 placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">Status</label>
              <Dropdown
                value={status}
                onValueChange={(val) => setStatus(val ?? statusOptions[0]?.value ?? "todo")}
                options={statusOptions}
                showSearch={false}
                renderTrigger={(selected) => {
                  const sc = getStatusColor(selected?.value ?? status);
                  return (
                    <div className="flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-slate-400" />
                      <span className={cn("px-2 py-0.5 rounded text-xs font-semibold", sc.className)} style={sc.style}>
                        {selected?.label ?? "To Do"}
                      </span>
                    </div>
                  );
                }}
                renderOption={(option) => {
                  const sc = getStatusColor(option.value);
                  return (
                    <div className="flex items-center gap-2">
                      <span className={cn("px-2 py-0.5 rounded text-xs font-semibold", sc.className)} style={sc.style}>
                        {option.label}
                      </span>
                    </div>
                  );
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">Project</label>
              <Dropdown
                value={projectId}
                onValueChange={setProjectId}
                options={projects.map((p) => ({ value: p.id, label: p.title }))}
                placeholder="No Project"
                searchPlaceholder="Search projects..."
                emptyText="No project found."
                noneLabel="No Project"
                icon={<Folder className="w-4 h-4 text-slate-400" />}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">Assignee</label>
            <Dropdown
              value={assigneeId}
              onValueChange={setAssigneeId}
              options={members.map((m) => ({ value: m.id, label: m.display_name ?? m.email ?? "Unknown" }))}
              placeholder="Unassigned"
              searchPlaceholder="Search members..."
              emptyText="No member found."
              noneLabel="Unassigned"
              renderTrigger={(selected) => {
                const member = selected ? members.find(m => m.id === selected.value) : null;
                return (
                  <div className="flex items-center gap-2">
                    {member ? (
                      <>
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={member.avatar_url ?? undefined} />
                          <AvatarFallback className="text-[9px]">{(member.display_name ?? "U").charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span>{member.display_name ?? member.email ?? "Unknown"}</span>
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500">Unassigned</span>
                      </>
                    )}
                  </div>
                );
              }}
              renderOption={(option) => {
                const member = members.find(m => m.id === option.value);
                return (
                  <div className="flex items-center gap-2">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={member?.avatar_url ?? undefined} />
                      <AvatarFallback className="text-[9px]">{(member?.display_name ?? "U").charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {option.label}
                  </div>
                );
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">Priority</label>
              <Dropdown
                value={priority}
                onValueChange={(val) => setPriority((val ?? "none") as Priority)}
                options={[
                  { value: "none", label: "None" },
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                  { value: "urgent", label: "Urgent" },
                ]}
                showSearch={false}
                renderTrigger={(selected) => (
                  <div className="flex items-center gap-2">
                    {selected && selected.value !== "none" && (
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        selected.value === "urgent" && "bg-red-500",
                        selected.value === "high" && "bg-orange-500",
                        selected.value === "medium" && "bg-blue-500",
                        selected.value === "low" && "bg-gray-400",
                      )} />
                    )}
                    <span className="text-sm">{selected?.label ?? "None"}</span>
                  </div>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">Due Date</label>
              <DatePicker
                value={dueDate}
                onChange={setDueDate}
                placeholder="Pick a due date"
              />
            </div>
          </div>
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
            disabled={!title.trim() || isSaving}
            className="h-9 px-5 rounded-lg bg-primary hover:opacity-90 text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
