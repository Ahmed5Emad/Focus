import {
  ListChecks,
  Plus,
  Search,
  MoreHorizontal,
  Calendar,
  Columns3,
  Folder,
  Target,
  CheckCircle2,
  Circle,
  Trash2,
  Pencil,
  Archive,
  User,
  Timer,
  Link2,
  GitBranch,
  Repeat,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Dropdown } from "@/components/shared/Dropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTasks } from "@/hooks/useTasks";
import { useGlobalPresence } from "@/hooks/useGlobalPresence";
import { useState, useRef, useEffect } from "react";
import { TaskEditDialog } from "./components/TaskEditDialog";
import { TaskDependenciesDialog } from "./components/TaskDependenciesDialog";
import { TaskRecurrenceDialog } from "./components/TaskRecurrenceDialog";
import { TaskTemplatesDialog } from "./components/TaskTemplatesDialog";
import TaskCalendarView from "./components/TaskCalendarView";
import KanbanBoard from "./components/KanbanBoard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Completed" },
] as const;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "title", label: "Title A-Z" },
];

function formatTrackedTime(totalSeconds: number): string {
  const seconds = Math.floor(totalSeconds);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainMin = minutes % 60;
  return `${hours}h ${remainMin}m`;
}

export default function Tasks() {
  const {
    tasks,
    projects,
    goals,
    members,
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    projectFilter,
    setProjectFilter,
    goalFilter,
    setGoalFilter,
    assigneeFilter,
    setAssigneeFilter,
    sortBy,
    setSortBy,
    filteredTasks,
    toggleTaskStatus,
    updateTask,
    deleteTask,
    undeleteTask,
    updateTaskRecurrence,
    workflowStatuses,
    customFields,
    taskCustomValues,
  } = useTasks();

  const onlineUsers = useGlobalPresence();

  const statusOptions = workflowStatuses.length > 0
    ? [{ value: "all", label: "All Status" } as const, ...workflowStatuses.map(s => ({ value: s.name, label: s.name }) as const)]
    : DEFAULT_STATUS_OPTIONS;

  const [editTask, setEditTask] = useState<(typeof tasks)[number] | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [dependenciesTaskId, setDependenciesTaskId] = useState<string | null>(null);
  const [dependenciesOpen, setDependenciesOpen] = useState(false);
  const [recurrenceTaskId, setRecurrenceTaskId] = useState<string | null>(null);
  const [recurrenceTaskRule, setRecurrenceTaskRule] = useState<string | null>(null);
  const [recurrenceOpen, setRecurrenceOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "calendar" | "kanban">("list");
  const BATCH_SIZE = 50;
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const visibleTasks = filteredTasks.slice(0, visibleCount);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisibleCount(BATCH_SIZE);
  }, [searchQuery, statusFilter, projectFilter, goalFilter, assigneeFilter, sortBy]);

  useEffect(() => {
    if (!sentinelRef.current || visibleCount >= filteredTasks.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filteredTasks.length));
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [filteredTasks.length, visibleCount]);

  const handleEdit = (task: (typeof tasks)[number]) => {
    setEditTask(task);
    setEditOpen(true);
  };

  return (
    <div className="page-container">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-6">
        <div className="flex flex-col gap-1">
          <h1 className="page-title">Tasks</h1>
          <p className="page-description">
            Manage your focus and track your progress across projects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setTemplatesOpen(true)}
            className="gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Open task templates"
          >
            <FileText className="w-4 h-4" />
            <span className="font-semibold tracking-wide uppercase text-[12px]">Templates</span>
          </Button>
          <Link to="/tasks/new">
            <Button className="btn-primary">
              <Plus className="w-4 h-4" />
              <span className="font-semibold tracking-wide uppercase text-[12px]">New Task</span>
            </Button>
          </Link>
        </div>
      </div>

        <div className="rounded-xl shadow-[0px_4px_12px_rgba(139,92,246,0.04)] border border-slate-100 bg-white p-2 flex flex-row flex-wrap items-center gap-2">
        <div className="relative w-full md:w-48 md:shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <Input
            placeholder="Search tasks..."
            className="pl-8 bg-white border-slate-100 focus:bg-white transition-all h-9 rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="filter-tabs">
              {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`filter-tab text-sm px-2.5 py-1 ${
                  statusFilter === opt.value
                    ? "filter-tab-active"
                    : "filter-tab-inactive"
                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <Dropdown
            value={projectFilter === "all" ? null : projectFilter}
            onValueChange={(val) => setProjectFilter(val ?? "all")}
            options={projects.map((p) => ({ value: p.id, label: p.title }))}
            placeholder="Project"
            searchPlaceholder="Search projects..."
            emptyText="No project found."
            noneLabel="All Projects"
            icon={<Folder className="w-3.5 h-3.5 text-primary" />}
            triggerClassName="filter-tab filter-tab-inactive w-32 h-auto border-0 bg-transparent hover:bg-transparent rounded-none px-0 py-0 text-sm"
          />

          <Dropdown
            value={goalFilter === "all" ? null : goalFilter}
            onValueChange={(val) => setGoalFilter(val ?? "all")}
            options={goals.map((g) => ({ value: g.id, label: g.title }))}
            placeholder="Goal"
            searchPlaceholder="Search goals..."
            emptyText="No goal found."
            noneLabel="All Goals"
            icon={<Target className="w-3.5 h-3.5 text-primary" />}
            triggerClassName="filter-tab filter-tab-inactive w-32 h-auto border-0 bg-transparent hover:bg-transparent rounded-none px-0 py-0 text-sm"
          />

          <Dropdown
            value={assigneeFilter === "all" ? null : assigneeFilter}
            onValueChange={(val) => setAssigneeFilter(val ?? "all")}
            options={members.map((m) => ({ value: m.id, label: m.display_name ?? m.email ?? "Unknown" }))}
            placeholder="Member"
            searchPlaceholder="Search members..."
            emptyText="No member found."
            noneLabel="All Members"
            icon={<User className="w-3.5 h-3.5 text-primary" />}
            triggerClassName="filter-tab filter-tab-inactive w-32 h-auto border-0 bg-transparent hover:bg-transparent rounded-none px-0 py-0 text-sm"
            renderOption={(option) => {
              const m = members.find(mem => mem.id === option.value);
              return (
                <div className="flex items-center gap-2">
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={m?.avatar_url ?? undefined} />
                    <AvatarFallback className="text-[9px]">{(m?.display_name ?? "U").charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {option.label}
                </div>
              );
            }}
          />

          <div className="h-5 w-px bg-slate-200 mx-1" />

          <div className="filter-tabs">
            <button
              onClick={() => setViewMode("list")}
              className={`filter-tab text-sm px-2 py-1 ${
                viewMode === "list" ? "filter-tab-active" : "filter-tab-inactive"
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
              aria-label="List view"
            >
              <ListChecks className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`filter-tab text-sm px-2 py-1 ${
                viewMode === "calendar" ? "filter-tab-active" : "filter-tab-inactive"
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
              aria-label="Calendar view"
            >
              <Calendar className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`filter-tab text-sm px-2 py-1 ${
                viewMode === "kanban" ? "filter-tab-active" : "filter-tab-inactive"
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
              aria-label="Board view"
            >
              <Columns3 className="w-4 h-4" />
            </button>
          </div>

          <Dropdown
            value={sortBy}
            onValueChange={(val) => setSortBy((val ?? "newest") as "newest" | "oldest" | "title")}
            options={SORT_OPTIONS}
            showSearch={false}
            triggerClassName="filter-tab filter-tab-inactive w-28 h-auto border-0 bg-transparent hover:bg-transparent rounded-none px-0 py-0 text-sm"
          />
        </div>
      </div>

      {viewMode === "calendar" ? (
        <TaskCalendarView tasks={filteredTasks} />
      ) : viewMode === "kanban" ? (
        <KanbanBoard tasks={filteredTasks} onStatusChange={toggleTaskStatus} workflowStatuses={workflowStatuses} />
      ) : (
        <>
          <div className="rounded-xl shadow-[0px_4px_12px_rgba(139,92,246,0.04)] border border-slate-100 bg-white overflow-hidden">
            {isLoading ? (
              <div className="divide-y divide-slate-200">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-5">
                    <Skeleton className="w-6 h-6 rounded-lg shrink-0" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                  </div>
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              (() => {
                const hasFilters = searchQuery ||
                  statusFilter !== "all" ||
                  projectFilter !== "all" ||
                  goalFilter !== "all" ||
                  assigneeFilter !== "all";
                return (
                  <EmptyState
                    icon={ListChecks}
                    title={hasFilters ? "No tasks found" : "Start your task list"}
                    description={hasFilters ? "Try adjusting your filters to find what you're looking for." : "Begin organizing your work. Create your first task and stay productive."}
                    action={hasFilters ? undefined : { label: "Create Your First Task", href: "/tasks/new" }}
                  />
                );
              })()
            ) : (
              <div className="divide-y divide-slate-200">
                {visibleTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors relative"
                  >
                    {task.status === "done" && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                    )}

                    <button
                      onClick={() => toggleTaskStatus(task.id, task.status)}
                      className={cn(
                        "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        task.status === "done"
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : workflowStatuses.length > 0
                            ? "border-slate-300 hover:border-primary bg-white"
                            : "border-slate-300 hover:border-primary bg-white",
                      )}
                      style={
                        workflowStatuses.length > 0 && task.status !== "done"
                          ? (() => {
                              const ws = workflowStatuses.find(s => s.name === task.status);
                              return ws ? { borderColor: ws.color, color: ws.color } : {};
                            })()
                          : {}
                      }
                      aria-label={`Toggle status for ${task.title}`}
                    >
                      {task.status === "done" ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Circle className="w-4 h-4 opacity-0 group-hover:opacity-20" />
                      )}
                    </button>

                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {task.priority && task.priority !== "none" && (
                          <span
                            className={cn(
                              "w-2 h-2 rounded-full shrink-0",
                              task.priority === "urgent" && "bg-red-500",
                              task.priority === "high" && "bg-orange-500",
                              task.priority === "medium" && "bg-blue-500",
                              task.priority === "low" && "bg-gray-400",
                            )}
                          />
                        )}
                        <h4
                          className={cn(
                            "font-['Spline_Sans',sans-serif] text-[16px] leading-[1.3] font-semibold truncate",
                            task.status === "done"
                              ? "text-slate-600 line-through"
                              : "text-slate-900",
                          )}
                        >
                          {task.title}
                        </h4>
                        {(workflowStatuses.length > 0
                          ? workflowStatuses.some(s => s.name === task.status)
                          : task.status === "in_progress") && (() => {
                          const ws = workflowStatuses.find(s => s.name === task.status);
                          return (
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                              style={ws ? { backgroundColor: ws.color + '20', color: ws.color } : { backgroundColor: '#eff6ff', color: '#2563eb' }}
                            >
                              {ws ? ws.name : "In Progress"}
                            </span>
                          );
                        })()}
                        {task.total_time_seconds ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                            <Timer className="w-3 h-3" />
                            {formatTrackedTime(task.total_time_seconds)}
                          </span>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        {task.assignee && (
                          <div className="flex items-center gap-1.5 font-['Inter',sans-serif] text-[14px] leading-normal text-slate-600">
                            <span className="relative inline-block">
                              <Avatar className="w-4 h-4">
                                <AvatarImage src={task.assignee.avatar_url ?? undefined} />
                                <AvatarFallback className="text-[7px]">{(task.assignee.display_name ?? "U").charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              {onlineUsers.has(task.assignee_id!) && (
                                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 ring-1 ring-white" />
                              )}
                            </span>
                            <span>{task.assignee.display_name}</span>
                          </div>
                        )}
                        {task.projects?.title && (
                          <div className="flex items-center gap-1.5 font-['Inter',sans-serif] text-[14px] leading-normal text-slate-600">
                            <Folder className="w-3.5 h-3.5 text-primary" />
                            <span>{task.projects.title}</span>
                          </div>
                        )}
                        {task.goals?.title && (
                          <div className="flex items-center gap-1.5 font-['Inter',sans-serif] text-[14px] leading-normal text-slate-600">
                            <Target className="w-3.5 h-3.5 text-primary" />
                            <span>{task.goals.title}</span>
                          </div>
                        )}
                        {task.due_date && (
                          <div className={cn(
                            "flex items-center gap-1.5 font-['Inter',sans-serif] text-[14px] leading-normal",
                            task.status !== "done" && new Date(task.due_date) < new Date(new Date().toDateString())
                              ? "text-red-500"
                              : "text-slate-600",
                          )}>
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {new Date(task.due_date).toDateString() === new Date().toDateString()
                                ? "Today"
                                : new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          </div>
                        )}
                    <div className="flex items-center gap-1.5 font-['Inter',sans-serif] text-[14px] leading-normal text-slate-600">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(task.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {task.subtask_count ? (
                      <div className="flex items-center gap-1 font-['Inter',sans-serif] text-[14px] leading-normal text-slate-400">
                        <GitBranch className="w-3.5 h-3.5" />
                        <span>{task.subtask_count}</span>
                      </div>
                    ) : null}
                    {task.dependency_count ? (
                      <div className="flex items-center gap-1 font-['Inter',sans-serif] text-[14px] leading-normal text-slate-400">
                        <Link2 className="w-3.5 h-3.5" />
                        <span>{task.dependency_count}</span>
                      </div>
                    ) : null}
                    {task.recurrence_rule && (
                      <div className="flex items-center gap-1 font-['Inter',sans-serif] text-[14px] leading-normal text-slate-400">
                        <Repeat className="w-3.5 h-3.5" />
                        <span className="capitalize text-[11px]">{task.recurrence_rule}</span>
                      </div>
                    )}
                    {taskCustomValues[task.id]?.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {taskCustomValues[task.id].map((cv) => {
                          const field = customFields.find(f => f.id === cv.field_id);
                          if (!field || !cv.value) return null;
                          return (
                            <span
                              key={cv.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f5f3ff] text-primary text-[10px] font-bold uppercase tracking-wider"
                              title={`${field.name}: ${cv.value}`}
                            >
                              {field.name}: {cv.value.length > 20 ? cv.value.slice(0, 20) + '...' : cv.value}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                    <div className="flex items-center gap-2 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-slate-600 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            aria-label="Task actions"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-44 rounded-xl"
                        >
                          <DropdownMenuItem
                            className="text-slate-600 cursor-pointer"
                            onClick={() => handleEdit(task)}
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-slate-600 cursor-pointer"
                        onClick={() => {
                          setDependenciesTaskId(task.id);
                          setDependenciesOpen(true);
                        }}
                      >
                        <Link2 className="w-4 h-4 mr-2" />
                        Dependencies
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-slate-600 cursor-pointer"
                        onClick={() => {
                          setRecurrenceTaskId(task.id);
                          setRecurrenceTaskRule(task.recurrence_rule ?? null);
                          setRecurrenceOpen(true);
                        }}
                      >
                        <Repeat className="w-4 h-4 mr-2" />
                        Set Recurrence
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-slate-600 cursor-pointer"
                        onClick={() => toggleTaskStatus(task.id, task.status)}
                      >
                        {workflowStatuses.length > 0
                          ? "Toggle Status"
                          : task.status === "done"
                            ? "Mark as Todo"
                            : task.status === "in_progress"
                              ? "Mark as Done"
                              : "Mark as In Progress"}
                      </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-slate-600 cursor-pointer"
                            onClick={async () => {
                              const success = await updateTask(task.id, { is_archived: true, archived_at: new Date().toISOString(), updated_at: new Date().toISOString() });
                              if (success) {
                                toast.success("Task archived");
                              } else {
                                toast.error("Failed to archive task");
                              }
                            }}
                          >
                            <Archive className="w-4 h-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 cursor-pointer"
                            onClick={async () => {
                              const taskId = task.id;
                              const success = await deleteTask(taskId);
                              if (success) {
                                toast("Task deleted", {
                                  action: {
                                    label: "Undo",
                                    onClick: () => undeleteTask(taskId),
                                  },
                                  actionButtonStyle: {
                                    backgroundColor: "var(--primary)",
                                    color: "white",
                                  },
                                  duration: 5000,
                                });
                              } else {
                                toast.error("Failed to delete task");
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                {visibleCount < filteredTasks.length && (
                  <div ref={sentinelRef} className="flex justify-center py-4">
                    <button
                      onClick={() => setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filteredTasks.length))}
                      className="text-sm text-primary hover:text-[#6a5cd8] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-4 py-2"
                    >
                      Show {Math.min(BATCH_SIZE, filteredTasks.length - visibleCount)} more tasks
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {!isLoading && filteredTasks.length > 0 && (
            <div className="mt-3 flex items-center justify-between px-2">
              <p className="font-['Inter',sans-serif] text-[14px] leading-normal text-slate-600 font-medium">
                {visibleCount < filteredTasks.length
                  ? `Showing ${visibleCount} of ${filteredTasks.length}`
                  : `Showing ${filteredTasks.length}`}{" "}
                {filteredTasks.length === 1 ? "task" : "tasks"}
              </p>
              <div className="flex items-center gap-4">
                {(() => {
                  const terminalStatus = workflowStatuses.length > 0
                    ? workflowStatuses[workflowStatuses.length - 1].name
                    : "done";
                  const terminalColor = workflowStatuses.length > 0
                    ? workflowStatuses[workflowStatuses.length - 1].color
                    : "#10b981";
                  return (
                    <>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: terminalColor }} />
                        <span className="font-['Inter',sans-serif] text-[14px] leading-normal text-slate-600">
                          {tasks.filter((t) => t.status === terminalStatus).length} Completed
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="font-['Inter',sans-serif] text-[14px] leading-normal text-slate-600">
                          {tasks.filter((t) => t.status !== terminalStatus).length} Remaining
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </>
      )}

      <TaskEditDialog
        key={editTask?.id}
        task={editTask}
        projects={projects}
        members={members}
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditTask(null);
        }}
        onSave={updateTask}
        workflowStatuses={workflowStatuses}
      />

      <TaskDependenciesDialog
        taskId={dependenciesTaskId ?? ""}
        open={dependenciesOpen}
        onOpenChange={(open) => {
          setDependenciesOpen(open);
          if (!open) setDependenciesTaskId(null);
        }}
        tasks={tasks}
      />

      <TaskRecurrenceDialog
        taskId={recurrenceTaskId ?? ""}
        currentRule={recurrenceTaskRule}
        open={recurrenceOpen}
        onOpenChange={(open) => {
          setRecurrenceOpen(open);
          if (!open) {
            setRecurrenceTaskId(null);
            setRecurrenceTaskRule(null);
          }
        }}
        onSave={updateTaskRecurrence}
      />

      <TaskTemplatesDialog
        open={templatesOpen}
        onOpenChange={setTemplatesOpen}
      />
    </div>
  );
}
