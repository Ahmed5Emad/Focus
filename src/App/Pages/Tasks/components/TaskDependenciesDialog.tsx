import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Link2, GitBranch, Plus, Trash2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/hooks/useTasks";
import { toast } from "sonner";

interface TaskDependenciesDialogProps {
  taskId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: Task[];
}

interface SubtaskItem {
  id: string;
  title: string;
  status: string;
  priority?: string;
}

interface DependencyItem {
  id: string;
  depends_on_task_id: string;
  title: string;
  status: string;
  priority?: string;
}

function priorityColor(p: string | undefined) {
  switch (p) {
    case "urgent": return "bg-red-500";
    case "high": return "bg-orange-500";
    case "medium": return "bg-blue-500";
    case "low": return "bg-gray-400";
    default: return "bg-transparent";
  }
}

function statusBadge(s: string) {
  switch (s) {
    case "todo": return "text-slate-400";
    case "in_progress": return "text-blue-500";
    case "done": return "text-emerald-500";
    default: return "text-slate-400";
  }
}

export function TaskDependenciesDialog({ taskId, open, onOpenChange, tasks }: TaskDependenciesDialogProps) {
  const [subtasks, setSubtasks] = useState<SubtaskItem[]>([]);
  const [dependencies, setDependencies] = useState<DependencyItem[]>([]);
  const [subtaskSearch, setSubtaskSearch] = useState("");
  const [depSearch, setDepSearch] = useState("");
  const [showSubtaskSearch, setShowSubtaskSearch] = useState(false);
  const [showDepSearch, setShowDepSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const subtaskInputRef = useRef<HTMLInputElement>(null);
  const depInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    if (!open || !taskId) return;
    setLoading(true);
    try {
      const [subtasksResult, depsResult] = await Promise.all([
        supabase
          .from('tasks')
          .select('id, title, status, priority')
          .eq('parent_task_id', taskId)
          .is('is_archived', false)
          .order('created_at', { ascending: false }),
        supabase
          .from('task_dependencies')
          .select('id, depends_on_task_id')
          .eq('task_id', taskId),
      ]);

      setSubtasks((subtasksResult.data ?? []).map(t => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
      })));

      if (depsResult.data && depsResult.data.length > 0) {
        const depTaskIds = depsResult.data.map(d => d.depends_on_task_id);
        const { data: depTasks } = await supabase
          .from('tasks')
          .select('id, title, status, priority')
          .in('id', depTaskIds);

        const taskMap = new Map(depTasks?.map(t => [t.id, t]) ?? []);
        setDependencies(depsResult.data.map(d => ({
          id: d.id,
          depends_on_task_id: d.depends_on_task_id,
          title: taskMap.get(d.depends_on_task_id)?.title ?? 'Unknown',
          status: taskMap.get(d.depends_on_task_id)?.status ?? 'todo',
          priority: taskMap.get(d.depends_on_task_id)?.priority,
        })));
      } else {
        setDependencies([]);
      }
    } catch (error) {
      console.error('Error loading task dependencies:', error);
    } finally {
      setLoading(false);
    }
  }, [taskId, open]);

  useEffect(() => {
    if (open) {
      loadData();
      setSubtaskSearch("");
      setDepSearch("");
      setShowSubtaskSearch(false);
      setShowDepSearch(false);
    }
  }, [open, loadData]);

  useEffect(() => {
    if (showSubtaskSearch && subtaskInputRef.current) {
      subtaskInputRef.current.focus();
    }
  }, [showSubtaskSearch]);

  useEffect(() => {
    if (showDepSearch && depInputRef.current) {
      depInputRef.current.focus();
    }
  }, [showDepSearch]);

  const addSubtask = async (parentTaskId: string, childTaskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ parent_task_id: parentTaskId })
      .eq('id', childTaskId);
    if (error) {
      toast.error("Failed to add subtask");
      return;
    }
    const task = tasks.find(t => t.id === childTaskId);
    if (task) {
      setSubtasks(prev => [...prev, {
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
      }]);
    }
    setShowSubtaskSearch(false);
    setSubtaskSearch("");
    toast.success("Subtask added");
  };

  const removeSubtask = async (childTaskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ parent_task_id: null })
      .eq('id', childTaskId);
    if (error) {
      toast.error("Failed to remove subtask");
      return;
    }
    setSubtasks(prev => prev.filter(s => s.id !== childTaskId));
    toast.success("Subtask removed");
  };

  const addDependencyItem = async (dependsOnTaskId: string) => {
    const { error } = await supabase
      .from('task_dependencies')
      .insert({ task_id: taskId, depends_on_task_id: dependsOnTaskId });
    if (error) {
      toast.error("Failed to add dependency");
      return;
    }
    const task = tasks.find(t => t.id === dependsOnTaskId);
    if (task) {
      // Fetch the dependency row to get its id
      const { data: newDep } = await supabase
        .from('task_dependencies')
        .select('id')
        .eq('task_id', taskId)
        .eq('depends_on_task_id', dependsOnTaskId)
        .single();
      setDependencies(prev => [...prev, {
        id: newDep?.id ?? '',
        depends_on_task_id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
      }]);
    }
    setShowDepSearch(false);
    setDepSearch("");
    toast.success("Dependency added");
  };

  const removeDependencyItem = async (dependsOnTaskId: string) => {
    const { error } = await supabase
      .from('task_dependencies')
      .delete()
      .eq('task_id', taskId)
      .eq('depends_on_task_id', dependsOnTaskId);
    if (error) {
      toast.error("Failed to remove dependency");
      return;
    }
    setDependencies(prev => prev.filter(d => d.depends_on_task_id !== dependsOnTaskId));
    toast.success("Dependency removed");
  };

  const subtaskIds = new Set(subtasks.map(s => s.id));
  const dependencyIds = new Set(dependencies.map(d => d.depends_on_task_id));

  const availableSubtasks = tasks.filter(t =>
    t.id !== taskId &&
    !subtaskIds.has(t.id) &&
    !t.is_archived &&
    (t.title.toLowerCase().includes(subtaskSearch.toLowerCase()))
  );

  const availableDeps = tasks.filter(t =>
    t.id !== taskId &&
    !dependencyIds.has(t.id) &&
    !t.is_archived &&
    (t.title.toLowerCase().includes(depSearch.toLowerCase()))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-['Spline_Sans',sans-serif] text-lg">Task Dependencies</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-2">
          {/* Subtasks Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 font-['Inter',sans-serif] text-sm font-semibold text-slate-700">
                <GitBranch className="w-4 h-4" />
                Subtasks
                {subtasks.length > 0 && (
                  <span className="text-xs text-slate-400 font-normal">({subtasks.length})</span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10"
                onClick={() => setShowSubtaskSearch(!showSubtaskSearch)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Subtask
              </Button>
            </div>

            {showSubtaskSearch && (
              <div className="mb-3 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  ref={subtaskInputRef}
                  value={subtaskSearch}
                  onChange={(e) => setSubtaskSearch(e.target.value)}
                  placeholder="Search tasks..."
                  className="pl-10 h-9 text-sm rounded-xl"
                />
                {subtaskSearch && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                    {availableSubtasks.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-slate-400">No tasks found</p>
                    ) : (
                      availableSubtasks.map(t => (
                        <button
                          key={t.id}
                          onClick={() => addSubtask(taskId, t.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                        >
                          {t.priority && t.priority !== "none" && (
                            <span className={cn("w-2 h-2 rounded-full shrink-0", priorityColor(t.priority))} />
                          )}
                          <span className="truncate flex-1">{t.title}</span>
                          <span className={cn("text-[10px] font-bold uppercase shrink-0", statusBadge(t.status))}>
                            {t.status === "in_progress" ? "In Progress" : t.status}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : subtasks.length === 0 ? (
              <p className="text-sm text-slate-400 py-2">No subtasks yet</p>
            ) : (
              <div className="space-y-1">
                {subtasks.map(s => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors group"
                  >
                    {s.priority && s.priority !== "none" && (
                      <span className={cn("w-2 h-2 rounded-full shrink-0", priorityColor(s.priority))} />
                    )}
                    <span className="flex-1 text-sm text-slate-700 truncate">{s.title}</span>
                    <span className={cn("text-[10px] font-bold uppercase shrink-0", statusBadge(s.status))}>
                      {s.status === "in_progress" ? "In Progress" : s.status}
                    </span>
                    <button
                      onClick={() => removeSubtask(s.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Dependencies Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 font-['Inter',sans-serif] text-sm font-semibold text-slate-700">
                <Link2 className="w-4 h-4" />
                Blocked By
                {dependencies.length > 0 && (
                  <span className="text-xs text-slate-400 font-normal">({dependencies.length})</span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10"
                onClick={() => setShowDepSearch(!showDepSearch)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Dependency
              </Button>
            </div>

            {showDepSearch && (
              <div className="mb-3 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  ref={depInputRef}
                  value={depSearch}
                  onChange={(e) => setDepSearch(e.target.value)}
                  placeholder="Search tasks..."
                  className="pl-10 h-9 text-sm rounded-xl"
                />
                {depSearch && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                    {availableDeps.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-slate-400">No tasks found</p>
                    ) : (
                      availableDeps.map(t => (
                        <button
                          key={t.id}
                          onClick={() => addDependencyItem(t.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                        >
                          {t.priority && t.priority !== "none" && (
                            <span className={cn("w-2 h-2 rounded-full shrink-0", priorityColor(t.priority))} />
                          )}
                          <span className="truncate flex-1">{t.title}</span>
                          <span className={cn("text-[10px] font-bold uppercase shrink-0", statusBadge(t.status))}>
                            {t.status === "in_progress" ? "In Progress" : t.status}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : dependencies.length === 0 ? (
              <p className="text-sm text-slate-400 py-2">No dependencies yet</p>
            ) : (
              <div className="space-y-1">
                {dependencies.map(d => (
                  <div
                    key={d.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors group"
                  >
                    {d.priority && d.priority !== "none" && (
                      <span className={cn("w-2 h-2 rounded-full shrink-0", priorityColor(d.priority))} />
                    )}
                    <span className="flex-1 text-sm text-slate-700 truncate">{d.title}</span>
                    <span className={cn("text-[10px] font-bold uppercase shrink-0", statusBadge(d.status))}>
                      {d.status === "in_progress" ? "In Progress" : d.status}
                    </span>
                    <button
                      onClick={() => removeDependencyItem(d.depends_on_task_id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
