import { useState, useEffect } from "react";
import { CheckCircle2, Circle, ListChecks, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  status: string;
  projects?: { title: string } | null;
}

interface Props {
  documentId: string;
  currentTaskId: string | null;
  onTaskChange: (taskId: string | null) => void;
}

export function TaskLinkSelector({ documentId, currentTaskId, onTaskChange }: Props) {
  const { currentWorkspaceId } = useAuth();
  const [supabase] = useState(() => createClient());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [open, setOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!currentWorkspaceId || !open) return;
    supabase
      .from("tasks")
      .select("id, title, status, projects(title)")
      .eq("workspace_id", currentWorkspaceId)
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setTasks(data as unknown as Task[]); });
  }, [currentWorkspaceId, open, supabase]);

  useEffect(() => {
    if (!currentTaskId || !currentWorkspaceId) return;
    supabase
      .from("tasks")
      .select("id, title, status, projects(title)")
      .eq("id", currentTaskId)
      .single()
      .then(({ data }) => { if (data) setCurrentTask(data as unknown as Task); });
  }, [currentTaskId, currentWorkspaceId, supabase]);

  const linkTask = async (taskId: string) => {
    await supabase
      .from("documents")
      .update({ task_id: taskId, updated_at: new Date().toISOString() })
      .eq("id", documentId);
    onTaskChange(taskId);
    setOpen(false);
  };

  const unlinkTask = async () => {
    await supabase
      .from("documents")
      .update({ task_id: null, updated_at: new Date().toISOString() })
      .eq("id", documentId);
    onTaskChange(null);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors",
            currentTaskId
              ? "text-[#7b68ee] bg-[#ede9fe] hover:bg-[#ddd6fe]"
              : "text-[#94a3b8] hover:text-[#64748b] hover:bg-[#f1f5f9]"
          )}
        >
          {currentTask?.status === "done" ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          ) : currentTaskId ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <ListChecks className="w-3.5 h-3.5" />
          )}
          <span className="truncate max-w-[160px]">
            {currentTask?.title || (currentTaskId ? "Loading..." : "Link Task")}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="end">
        <Command>
          <CommandInput placeholder="Search tasks..." />
          <CommandList>
            <CommandEmpty>No tasks found</CommandEmpty>
            {currentTaskId && (
              <CommandGroup>
                <CommandItem
                  onSelect={unlinkTask}
                  className="text-red-500 data-[selected=true]:text-red-500 data-[selected=true]:bg-red-50"
                >
                  <X className="w-4 h-4" />
                  Remove task link
                </CommandItem>
              </CommandGroup>
            )}
            <CommandGroup heading="Tasks">
              {tasks.map((task) => (
                <CommandItem
                  key={task.id}
                  onSelect={() => linkTask(task.id)}
                  className={cn(
                    task.id === currentTaskId && "bg-[#ede9fe]"
                  )}
                >
                  {task.status === "done" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-[#94a3b8] shrink-0" />
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="truncate">{task.title}</span>
                    {task.projects?.title && (
                      <span className="text-[10px] text-[#94a3b8] truncate">
                        {task.projects.title}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
