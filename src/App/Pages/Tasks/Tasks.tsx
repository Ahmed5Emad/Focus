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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 pt-6">
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
            className="gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary h-9 md:h-10"
            aria-label="Open task templates"
          >
            <FileText className="w-4 h-4" />
            <span className="font-semibold tracking-wide uppercase text-[11px] md:text-[12px]">Templates</span>
          </Button>
          <Link to="/tasks/new">
            <Button className="bg-linear-to-r from-[#7c3aed] to-[#4f46e5] hover:opacity-90 text-white shadow-lg shadow-purple-500/20 h-9 md:h-11 px-4 md:px-6 rounded-xl flex items-center gap-2 border-none">
              <Plus className="w-4 h-4" />
              <span className="font-semibold tracking-wide uppercase text-[11px] md:text-[12px]">New Task</span>
            </Button>
          </Link>
        </div>
      </div>

        <div className="rounded-xl shadow-[0px_4px_12px_rgba(139,92,246,0.04)] border border-border bg-card p-2">
          <div className="relative w-full mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-8 bg-muted/50 border-border focus:bg-card transition-all h-9 rounded-lg text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none">
            <div className="filter-tabs shrink-0">
              {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`filter-tab whitespace-nowrap px-2 sm:px-4 py-0.5 sm:py-2 text-[11px] sm:text-[14px] ${
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
            icon={<Folder className="w-3 h-3 text-primary" />}
            triggerClassName="shrink-0 flex items-center gap-1 text-[11px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-border bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors h-auto min-h-0"
          />

          <Dropdown
            value={goalFilter === "all" ? null : goalFilter}
            onValueChange={(val) => setGoalFilter(val ?? "all")}
            options={goals.map((g) => ({ value: g.id, label: g.title }))}
            placeholder="Goal"
            searchPlaceholder="Search goals..."
            emptyText="No goal found."
            noneLabel="All Goals"
            icon={<Target className="w-3 h-3 text-primary" />}
            triggerClassName="shrink-0 flex items-center gap-1 text-[11px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-border bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors h-auto min-h-0"
          />

          <Dropdown
            value={assigneeFilter === "all" ? null : assigneeFilter}
            onValueChange={(val) => setAssigneeFilter(val ?? "all")}
            options={members.map((m) => ({ value: m.id, label: m.display_name ?? m.email ?? "Unknown" }))}
            placeholder="Member"
            searchPlaceholder="Search members..."
            emptyText="No member found."
            noneLabel="All Members"
            icon={<User className="w-3 h-3 text-primary" />}
            triggerClassName="shrink-0 flex items-center gap-1 text-[11px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-border bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors h-auto min-h-0"
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

          <div className="h-4 w-px bg-border mx-0.5 shrink-0" />

          <div className="filter-tabs shrink-0">
            <button
              onClick={() => setViewMode("list")}
              className={`filter-tab px-1.5 sm:px-4 py-0.5 sm:py-2 ${
                viewMode === "list" ? "filter-tab-active" : "filter-tab-inactive"
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
              aria-label="List view"
            >
              <ListChecks className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`filter-tab px-1.5 sm:px-4 py-0.5 sm:py-2 ${
                viewMode === "calendar" ? "filter-tab-active" : "filter-tab-inactive"
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
              aria-label="Calendar view"
            >
              <Calendar className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`filter-tab px-1.5 sm:px-4 py-0.5 sm:py-2 ${
                viewMode === "kanban" ? "filter-tab-active" : "filter-tab-inactive"
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
              aria-label="Board view"
            >
              <Columns3 className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            </button>
          </div>

          <Dropdown
            value={sortBy}
            onValueChange={(val) => setSortBy((val ?? "newest") as "newest" | "oldest" | "title")}
            options={SORT_OPTIONS}
            showSearch={false}
            triggerClassName="shrink-0 flex items-center gap-1 text-[11px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-border bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors h-auto min-h-0"
          />
        </div>
      </div>

      {viewMode === "calendar" ? (
        <TaskCalendarView tasks={filteredTasks} />
      ) : viewMode === "kanban" ? (
        <KanbanBoard tasks={filteredTasks} onStatusChange={toggleTaskStatus} workflowStatuses={workflowStatuses} />
      ) : (
        <>
          <div className="rounded-xl shadow-[0px_4px_12px_rgba(139,92,246,0.04)] border border-border bg-card overflow-hidden">
            {isLoading ? (
              <div className="divide-y divide-border">
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
              <div className="divide-y divide-border">
                {visibleTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-center gap-3 md:gap-4 p-3 md:p-5 hover:bg-muted/40 transition-colors relative"
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
                            ? "border-border hover:border-primary bg-card"
                            : "border-border hover:border-primary bg-card",
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

                    <div className="flex flex-col gap-0.5 md:gap-1 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
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
                            "font-['Spline_Sans',sans-serif] text-[14px] md:text-[16px] leading-[1.3] font-semibold truncate",
                            task.status === "done"
                              ? "text-muted-foreground line-through"
                              : "text-foreground",
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
                              className="px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider shrink-0"
                              style={ws ? { backgroundColor: ws.color + '20', color: ws.color } : { backgroundColor: '#eff6ff', color: '#2563eb' }}
                            >
                              {ws ? ws.name : "In Progress"}
                            </span>
                          );
                        })()}
                        {task.total_time_seconds ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[9px] md:text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 shrink-0">
                            <Timer className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            {formatTrackedTime(task.total_time_seconds)}
                          </span>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 md:gap-x-4 gap-y-0.5">
                        {task.assignee && (
                          <div className="flex items-center gap-1.5 font-['Inter',sans-serif] text-[12px] md:text-[14px] leading-normal text-muted-foreground">
                            <span className="relative inline-block">
                              <Avatar className="w-3.5 h-3.5 md:w-4 md:h-4">
                                <AvatarImage src={task.assignee.avatar_url ?? undefined} />
                                <AvatarFallback className="text-[7px]">{(task.assignee.display_name ?? "U").charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              {onlineUsers.has(task.assignee_id!) && (
                                <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 ring-1 ring-background" />
                              )}
                            </span>
                            <span className="truncate max-w-[80px] md:max-w-none">{task.assignee.display_name}</span>
                          </div>
                        )}
                        {task.projects?.title && (
                          <div className="flex items-center gap-1.5 font-['Inter',sans-serif] text-[12px] md:text-[14px] leading-normal text-muted-foreground">
                            <Folder className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary" />
                            <span className="truncate max-w-[100px]">{task.projects.title}</span>
                          </div>
                        )}
                        {task.goals?.title && (
                          <div className="flex items-center gap-1.5 font-['Inter',sans-serif] text-[12px] md:text-[14px] leading-normal text-muted-foreground">
                            <Target className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary" />
                            <span className="truncate max-w-[100px]">{task.goals.title}</span>
                          </div>
                        )}
                        {task.due_date && (
                          <div className={cn(
                            "flex items-center gap-1.5 font-['Inter',sans-serif] text-[12px] md:text-[14px] leading-normal",
                            task.status !== "done" && new Date(task.due_date) < new Date(new Date().toDateString())
                              ? "text-red-500"
                              : "text-muted-foreground",
                          )}>
                            <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5" />
                            <span>
                              {new Date(task.due_date).toDateString() === new Date().toDateString()
                                ? "Today"
                                : new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          </div>
                        )}
                    <div className="flex items-center gap-1.5 font-['Inter',sans-serif] text-[12px] md:text-[14px] leading-normal text-muted-foreground">
                      <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      <span>
                        {new Date(task.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {task.subtask_count ? (
                      <div className="flex items-center gap-1 font-['Inter',sans-serif] text-[12px] md:text-[14px] leading-normal text-muted-foreground/70">
                        <GitBranch className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        <span>{task.subtask_count}</span>
                      </div>
                    ) : null}
                    {task.dependency_count ? (
                      <div className="flex items-center gap-1 font-['Inter',sans-serif] text-[12px] md:text-[14px] leading-normal text-muted-foreground/70">
                        <Link2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        <span>{task.dependency_count}</span>
                      </div>
                    ) : null}
                    {task.recurrence_rule && (
                      <div className="flex items-center gap-1 font-['Inter',sans-serif] text-[12px] md:text-[14px] leading-normal text-muted-foreground/70">
                        <Repeat className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        <span className="capitalize text-[10px] md:text-[11px]">{task.recurrence_rule}</span>
                      </div>
                    )}
                    {taskCustomValues[task.id]?.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5 md:mt-1">
                        {taskCustomValues[task.id].map((cv) => {
                          const field = customFields.find(f => f.id === cv.field_id);
                          if (!field || !cv.value) return null;
                          return (
                            <span
                              key={cv.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cu-purple/10 text-primary text-[9px] md:text-[10px] font-bold uppercase tracking-wider"
                              title={`${field.name}: ${cv.value}`}
                            >
                              {field.name}: {cv.value.length > 15 ? cv.value.slice(0, 15) + '...' : cv.value}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                    <div className="flex items-center gap-1 md:gap-2 shrink-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
                            className="text-muted-foreground cursor-pointer"
                            onClick={() => handleEdit(task)}
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-muted-foreground cursor-pointer"
                        onClick={() => {
                          setDependenciesTaskId(task.id);
                          setDependenciesOpen(true);
                        }}
                      >
                        <Link2 className="w-4 h-4 mr-2" />
                        Dependencies
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-muted-foreground cursor-pointer"
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
                        className="text-muted-foreground cursor-pointer"
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
                            className="text-muted-foreground cursor-pointer"
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
              <p className="font-['Inter',sans-serif] text-[14px] leading-normal text-muted-foreground font-medium">
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
                        <span className="font-['Inter',sans-serif] text-[14px] leading-normal text-muted-foreground">
                          {tasks.filter((t) => t.status === terminalStatus).length} Completed
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="font-['Inter',sans-serif] text-[14px] leading-normal text-muted-foreground">
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
