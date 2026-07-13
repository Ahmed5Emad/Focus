import { Task, WorkflowStatus } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Folder, Target, Calendar } from "lucide-react";

interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: string) => void;
  workflowStatuses?: WorkflowStatus[];
}

const DEFAULT_COLUMNS = [
  { status: "todo", label: "Todo", color: "bg-red-500" },
  { status: "in_progress", label: "In Progress", color: "bg-blue-500" },
  { status: "done", label: "Done", color: "bg-emerald-500" },
] as const;

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-blue-500",
  low: "bg-gray-400",
};

function isOverdue(dueDate: string, status: string, workflowStatuses?: WorkflowStatus[]): boolean {
  const terminalStatus = workflowStatuses && workflowStatuses.length > 0
    ? workflowStatuses[workflowStatuses.length - 1].name
    : "done";
  if (status === terminalStatus) return false;
  const today = new Date(new Date().toDateString());
  return new Date(dueDate) < today;
}

function formatCardDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return "Today";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function KanbanBoard({ tasks, onStatusChange, workflowStatuses }: KanbanBoardProps) {
  const columns = workflowStatuses && workflowStatuses.length > 0
    ? workflowStatuses.map(s => ({ status: s.name, label: s.name, color: s.color }))
    : DEFAULT_COLUMNS;

  const colCount = columns.length;

  return (
    <div className="grid gap-5" style={{ gridTemplateColumns: `repeat(${Math.min(colCount, 4)}, minmax(0, 1fr))` }}>
      {columns.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.status);
        return (
          <div
            key={col.status}
            className="bg-slate-50 rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-4">
              {(typeof col.color === 'string' && col.color.startsWith('#')) ? (
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
              ) : (
                <span className={cn("w-2.5 h-2.5 rounded-full", col.color as string)} />
              )}
              <h3 className="font-['Spline_Sans',sans-serif] text-[15px] font-semibold text-slate-900">
                {col.label}
              </h3>
              <span className="ml-auto text-xs font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                {columnTasks.length}
              </span>
            </div>

            <div className="space-y-3">
              {columnTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 dark:border-0 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {task.priority && task.priority !== "none" && (
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full shrink-0 mt-1.5",
                            PRIORITY_COLORS[task.priority],
                          )}
                        />
                      )}
                      <h4
                        className={cn(
                          "font-['Spline_Sans',sans-serif] text-[15px] leading-[1.3] font-semibold truncate",
                          task.status === "done"
                            ? "text-slate-600 line-through"
                            : "text-slate-900",
                        )}
                      >
                        {task.title}
                      </h4>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg text-slate-600 hover:text-slate-900 shrink-0"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 rounded-xl">
                        {columns.filter((c) => c.status !== task.status).map((c) => (
                          <DropdownMenuItem
                            key={c.status}
                            className="text-slate-600 cursor-pointer"
                            onClick={() => onStatusChange(task.id, c.status)}
                          >
                            Move to {c.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3">
                    {task.assignee && (
                      <div className="flex items-center gap-1 font-['Inter',sans-serif] text-[13px] leading-normal text-slate-600">
                        <Avatar className="w-4 h-4">
                          <AvatarImage src={task.assignee.avatar_url ?? undefined} />
                          <AvatarFallback className="text-[7px]">
                            {(task.assignee.display_name ?? "U").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate max-w-[80px]">
                          {task.assignee.display_name}
                        </span>
                      </div>
                    )}
                    {task.projects?.title && (
                      <div className="flex items-center gap-1 font-['Inter',sans-serif] text-[13px] leading-normal text-slate-600">
                        <Folder className="w-3 h-3 text-primary" />
                        <span className="truncate max-w-[100px]">
                          {task.projects.title}
                        </span>
                      </div>
                    )}
                    {task.goals?.title && (
                      <div className="flex items-center gap-1 font-['Inter',sans-serif] text-[13px] leading-normal text-slate-600">
                        <Target className="w-3 h-3 text-primary" />
                        <span className="truncate max-w-[100px]">
                          {task.goals.title}
                        </span>
                      </div>
                    )}
                    {task.due_date && (
                      <div
                        className={cn(
                          "flex items-center gap-1 font-['Inter',sans-serif] text-[13px] leading-normal",
                          isOverdue(task.due_date, task.status, workflowStatuses)
                            ? "text-red-500"
                            : "text-slate-600",
                        )}
                      >
                        <Calendar className="w-3 h-3" />
                        <span>{formatCardDate(task.due_date)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {columnTasks.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-8 font-['Inter',sans-serif]">
                  No tasks
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
