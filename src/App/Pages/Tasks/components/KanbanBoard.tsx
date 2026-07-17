import type { Task, WorkflowStatus } from "@/hooks/useTasks";
import { useGlobalPresence } from "@/hooks/useGlobalPresence";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Folder, Target, Calendar, ChevronDown } from "lucide-react";
import { useState } from "react";

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

function MobileColumn({ col, tasks, onlineUsers, onStatusChange, workflowStatuses, allColumns }: {
  col: { status: string; label: string; color: string };
  tasks: Task[];
  onlineUsers: Set<string>;
  onStatusChange: (taskId: string, newStatus: string) => void;
  workflowStatuses?: WorkflowStatus[];
  allColumns: readonly { status: string; label: string; color: string }[];
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-muted/50 rounded-2xl">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 w-full p-3 md:hidden"
      >
        {(typeof col.color === 'string' && col.color.startsWith('#')) ? (
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
        ) : (
          <span className={cn("w-2.5 h-2.5 rounded-full", col.color as string)} />
        )}
        <h3 className="font-['Spline_Sans',sans-serif] text-[13px] font-semibold text-foreground">
          {col.label}
        </h3>
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full ml-1">
          {tasks.length}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform ${collapsed ? '' : 'rotate-180'}`} />
      </button>

      <div className="hidden md:flex items-center gap-2 mb-4 px-4 pt-4">
        {(typeof col.color === 'string' && col.color.startsWith('#')) ? (
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
        ) : (
          <span className={cn("w-2.5 h-2.5 rounded-full", col.color as string)} />
        )}
        <h3 className="font-['Spline_Sans',sans-serif] text-[15px] font-semibold text-foreground">
          {col.label}
        </h3>
        <span className="ml-auto text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div className={`space-y-2 md:space-y-3 p-3 md:p-4 md:pt-0 ${collapsed ? 'hidden md:block' : ''}`}>
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-card rounded-2xl shadow-sm border border-border p-3 md:p-4 hover:shadow-md transition-shadow"
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
                    "font-['Spline_Sans',sans-serif] text-[13px] md:text-[15px] leading-[1.3] font-semibold truncate",
                    task.status === "done"
                      ? "text-muted-foreground line-through"
                      : "text-foreground",
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
                    className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 rounded-xl">
                  {allColumns.filter((c) => c.status !== task.status).map((c) => (
                    <DropdownMenuItem
                      key={c.status}
                      className="text-muted-foreground cursor-pointer"
                      onClick={() => onStatusChange(task.id, c.status)}
                    >
                      Move to {c.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 md:mt-3">
              {task.assignee && (
                <div className="flex items-center gap-1 font-['Inter',sans-serif] text-[12px] md:text-[13px] leading-normal text-muted-foreground">
                  <span className="relative inline-block">
                    <Avatar className="w-3.5 h-3.5 md:w-4 md:h-4">
                      <AvatarImage src={task.assignee.avatar_url ?? undefined} />
                      <AvatarFallback className="text-[7px]">
                        {(task.assignee.display_name ?? "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {onlineUsers.has(task.assignee_id!) && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 ring-1 ring-background" />
                    )}
                  </span>
                  <span className="truncate max-w-[60px] md:max-w-[80px]">
                    {task.assignee.display_name}
                  </span>
                </div>
              )}
              {task.projects?.title && (
                <div className="flex items-center gap-1 font-['Inter',sans-serif] text-[12px] md:text-[13px] leading-normal text-muted-foreground">
                  <Folder className="w-2.5 h-2.5 md:w-3 md:h-3 text-primary" />
                  <span className="truncate max-w-[60px] md:max-w-[100px]">
                    {task.projects.title}
                  </span>
                </div>
              )}
              {task.goals?.title && (
                <div className="flex items-center gap-1 font-['Inter',sans-serif] text-[12px] md:text-[13px] leading-normal text-muted-foreground">
                  <Target className="w-2.5 h-2.5 md:w-3 md:h-3 text-primary" />
                  <span className="truncate max-w-[60px] md:max-w-[100px]">
                    {task.goals.title}
                  </span>
                </div>
              )}
              {task.due_date && (
                <div
                  className={cn(
                    "flex items-center gap-1 font-['Inter',sans-serif] text-[12px] md:text-[13px] leading-normal",
                    isOverdue(task.due_date, task.status, workflowStatuses)
                      ? "text-destructive"
                      : "text-muted-foreground",
                  )}
                >
                  <Calendar className="w-2.5 h-2.5 md:w-3 md:h-3" />
                  <span>{formatCardDate(task.due_date)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <p className="text-xs md:text-sm text-muted-foreground/60 text-center py-6 md:py-8 font-['Inter',sans-serif]">
            No tasks
          </p>
        )}
      </div>
    </div>
  );
}

export default function KanbanBoard({ tasks, onStatusChange, workflowStatuses }: KanbanBoardProps) {
  const onlineUsers = useGlobalPresence();
  const columns = workflowStatuses && workflowStatuses.length > 0
    ? workflowStatuses.map(s => ({ status: s.name, label: s.name, color: s.color }))
    : DEFAULT_COLUMNS;

  return (
    <>
      {/* Mobile: stacked columns */}
      <div className="flex flex-col gap-3 md:hidden">
        {columns.map((col) => (
          <MobileColumn
            key={col.status}
            col={col}
            tasks={tasks.filter((t) => t.status === col.status)}
            onlineUsers={onlineUsers}
            onStatusChange={onStatusChange}
            workflowStatuses={workflowStatuses}
            allColumns={columns}
          />
        ))}
      </div>

      {/* Desktop: horizontal grid */}
      <div className="hidden md:grid gap-5 -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto"
        style={{ gridTemplateColumns: `repeat(${Math.min(columns.length, 4)}, minmax(0, 1fr))` }}>
        {columns.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.status);
          return (
            <div
              key={col.status}
              className="bg-muted/50 rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-4">
                {(typeof col.color === 'string' && col.color.startsWith('#')) ? (
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                ) : (
                  <span className={cn("w-2.5 h-2.5 rounded-full", col.color as string)} />
                )}
                <h3 className="font-['Spline_Sans',sans-serif] text-[15px] font-semibold text-foreground">
                  {col.label}
                </h3>
                <span className="ml-auto text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-card rounded-2xl shadow-sm border border-border p-4 hover:shadow-md transition-shadow"
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
                              ? "text-muted-foreground line-through"
                              : "text-foreground",
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
                            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 rounded-xl">
                  {columns.filter((c) => c.status !== task.status).map((c) => (
                            <DropdownMenuItem
                              key={c.status}
                              className="text-muted-foreground cursor-pointer"
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
                        <div className="flex items-center gap-1 font-['Inter',sans-serif] text-[13px] leading-normal text-muted-foreground">
                          <span className="relative inline-block">
                            <Avatar className="w-4 h-4">
                              <AvatarImage src={task.assignee.avatar_url ?? undefined} />
                              <AvatarFallback className="text-[7px]">
                                {(task.assignee.display_name ?? "U").charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {onlineUsers.has(task.assignee_id!) && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 ring-1 ring-background" />
                            )}
                          </span>
                          <span className="truncate max-w-[80px]">
                            {task.assignee.display_name}
                          </span>
                        </div>
                      )}
                      {task.projects?.title && (
                        <div className="flex items-center gap-1 font-['Inter',sans-serif] text-[13px] leading-normal text-muted-foreground">
                          <Folder className="w-3 h-3 text-primary" />
                          <span className="truncate max-w-[100px]">
                            {task.projects.title}
                          </span>
                        </div>
                      )}
                      {task.goals?.title && (
                        <div className="flex items-center gap-1 font-['Inter',sans-serif] text-[13px] leading-normal text-muted-foreground">
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
                              ? "text-destructive"
                              : "text-muted-foreground",
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
                  <p className="text-sm text-muted-foreground/60 text-center py-8 font-['Inter',sans-serif]">
                    No tasks
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
