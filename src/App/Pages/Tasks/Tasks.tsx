import {
  ListChecks,
  Plus,
  Search,
  MoreHorizontal,
  Calendar,
  Folder,
  Target,
  CheckCircle2,
  Circle,
  Trash2,
  Pencil,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
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
import { useState } from "react";
import { TaskEditDialog } from "./components/TaskEditDialog";

const STATUS_OPTIONS = [
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
  } = useTasks();

  const [editTask, setEditTask] = useState<(typeof tasks)[number] | null>(null);
  const [editOpen, setEditOpen] = useState(false);

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

        <Link to="/tasks/new">
          <Button className="btn-primary">
            <Plus className="w-4 h-4" />
            <span className="font-semibold tracking-wide uppercase text-[12px]">New Task</span>
          </Button>
        </Link>
      </div>

      <div className="rounded-xl shadow-[0px_4px_12px_rgba(139,92,246,0.04)] border border-slate-100 bg-white p-2 flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#494454]" />
          <Input
            placeholder="Search tasks..."
            className="pl-10 bg-white border-slate-100 focus:bg-white transition-all h-10 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="filter-tabs">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`filter-tab ${
                  statusFilter === opt.value
                    ? "filter-tab-active"
                    : "filter-tab-inactive"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <Dropdown
            value={projectFilter === "all" ? null : projectFilter}
            onValueChange={(val) => setProjectFilter(val ?? "all")}
            options={projects.map((p) => ({ value: p.id, label: p.title }))}
            placeholder="All Projects"
            searchPlaceholder="Search projects..."
            emptyText="No project found."
            noneLabel="All Projects"
            icon={<Folder className="w-3.5 h-3.5 text-[#7b68ee]" />}
            triggerClassName="filter-tab filter-tab-inactive w-44 h-auto border-0 bg-transparent hover:bg-transparent rounded-none px-0 py-0 text-sm"
          />

          <Dropdown
            value={goalFilter === "all" ? null : goalFilter}
            onValueChange={(val) => setGoalFilter(val ?? "all")}
            options={goals.map((g) => ({ value: g.id, label: g.title }))}
            placeholder="All Goals"
            searchPlaceholder="Search goals..."
            emptyText="No goal found."
            noneLabel="All Goals"
            icon={<Target className="w-3.5 h-3.5 text-[#7b68ee]" />}
            triggerClassName="filter-tab filter-tab-inactive w-44 h-auto border-0 bg-transparent hover:bg-transparent rounded-none px-0 py-0 text-sm"
          />

          <Dropdown
            value={assigneeFilter === "all" ? null : assigneeFilter}
            onValueChange={(val) => setAssigneeFilter(val ?? "all")}
            options={members.map((m) => ({ value: m.id, label: m.display_name ?? m.email ?? "Unknown" }))}
            placeholder="All Members"
            searchPlaceholder="Search members..."
            emptyText="No member found."
            noneLabel="All Members"
            icon={<User className="w-3.5 h-3.5 text-[#7b68ee]" />}
            triggerClassName="filter-tab filter-tab-inactive w-44 h-auto border-0 bg-transparent hover:bg-transparent rounded-none px-0 py-0 text-sm"
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

          <div className="h-6 w-px bg-slate-200 mx-1 hidden lg:block" />

          <Dropdown
            value={sortBy}
            onValueChange={(val) => setSortBy((val ?? "newest") as "newest" | "oldest" | "title")}
            options={SORT_OPTIONS}
            showSearch={false}
            triggerClassName="filter-tab filter-tab-inactive w-44 h-auto border-0 bg-transparent hover:bg-transparent rounded-none px-0 py-0 text-sm"
          />
        </div>
      </div>

      <div className="rounded-xl shadow-[0px_4px_12px_rgba(139,92,246,0.04)] border border-slate-100 bg-white overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-[#ede9fe] border-t-[#7b68ee] rounded-full animate-spin" />
            <p className="font-['Inter',sans-serif] text-[16px] leading-normal text-[#494454] font-medium">Loading your tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
              <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-[#7b68ee] rounded-full blur-3xl"></div>
              <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-[#7b68ee] rounded-full blur-3xl"></div>
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-linear-to-br from-[#f5f3ff] to-[#ede9fe] rounded-3xl flex items-center justify-center mb-8 shadow-sm rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <ListChecks className="w-12 h-12 text-[#7b68ee]" />
              </div>
              <h2 className="font-['Spline_Sans',sans-serif] text-[32px] md:text-[40px] leading-tight font-bold text-[#0b1c30] mb-4 tracking-tight">
                {searchQuery ||
                statusFilter !== "all" ||
                projectFilter !== "all" ||
                goalFilter !== "all" ||
                assigneeFilter !== "all"
                  ? "No tasks found"
                  : "Start your task list"}
              </h2>
              <p className="font-['Inter',sans-serif] text-[18px] leading-relaxed text-[#494454] max-w-lg mb-10">
                {searchQuery ||
                statusFilter !== "all" ||
                projectFilter !== "all" ||
                goalFilter !== "all" ||
                assigneeFilter !== "all"
                  ? "Try adjusting your filters to find what you're looking for."
                  : "Begin organizing your work. Create your first task and stay productive."}
              </p>
              <Link to="/tasks/new">
                <Button className="btn-primary w-fit">
                  <Plus className="w-4 h-4" />
                  Create Your First Task
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#f1f5f9]">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="group flex items-center gap-4 p-5 hover:bg-[#f8f7fc] transition-colors relative"
              >
                {task.status === "done" && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                )}

                <button
                  onClick={() => toggleTaskStatus(task.id, task.status)}
                  className={cn(
                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0",
                    task.status === "done"
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-slate-300 hover:border-[#7b68ee] bg-white",
                  )}
                >
                  {task.status === "done" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4 opacity-0 group-hover:opacity-20" />
                  )}
                </button>

                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4
                      className={cn(
                        "font-['Spline_Sans',sans-serif] text-[16px] leading-[1.3] font-semibold truncate",
                        task.status === "done"
                          ? "text-[#494454] line-through"
                          : "text-[#0b1c30]",
                      )}
                    >
                      {task.title}
                    </h4>
                    {task.status === "in_progress" && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                        In Progress
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    {task.assignee && (
                      <div className="flex items-center gap-1.5 font-['Inter',sans-serif] text-[14px] leading-normal text-[#494454]">
                        <Avatar className="w-4 h-4">
                          <AvatarImage src={task.assignee.avatar_url ?? undefined} />
                          <AvatarFallback className="text-[7px]">{(task.assignee.display_name ?? "U").charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span>{task.assignee.display_name}</span>
                      </div>
                    )}
                    {task.projects?.title && (
                      <div className="flex items-center gap-1.5 font-['Inter',sans-serif] text-[14px] leading-normal text-[#494454]">
                        <Folder className="w-3.5 h-3.5 text-[#7b68ee]" />
                        <span>{task.projects.title}</span>
                      </div>
                    )}
                    {task.goals?.title && (
                      <div className="flex items-center gap-1.5 font-['Inter',sans-serif] text-[14px] leading-normal text-[#494454]">
                        <Target className="w-3.5 h-3.5 text-[#7b68ee]" />
                        <span>{task.goals.title}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 font-['Inter',sans-serif] text-[14px] leading-normal text-[#494454]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(task.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-[#494454] hover:text-[#0b1c30]"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-40 rounded-xl"
                    >
                      <DropdownMenuItem
                        className="text-[#494454] cursor-pointer"
                        onClick={() => handleEdit(task)}
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-[#494454] cursor-pointer"
                        onClick={() => toggleTaskStatus(task.id, task.status)}
                      >
                        {task.status === "done"
                          ? "Mark as Todo"
                          : "Mark as Done"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600 cursor-pointer"
                        onClick={() => deleteTask(task.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Task
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!isLoading && filteredTasks.length > 0 && (
        <div className="mt-6 flex items-center justify-between px-2">
          <p className="font-['Inter',sans-serif] text-[14px] leading-normal text-[#494454] font-medium">
            Showing {filteredTasks.length}{" "}
            {filteredTasks.length === 1 ? "task" : "tasks"}
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-['Inter',sans-serif] text-[14px] leading-normal text-[#494454]">
                {tasks.filter((t) => t.status === "done").length} Completed
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#7b68ee]" />
              <span className="font-['Inter',sans-serif] text-[14px] leading-normal text-[#494454]">
                {tasks.filter((t) => t.status !== "done").length} Remaining
              </span>
            </div>
          </div>
        </div>
      )}

      <TaskEditDialog
        task={editTask}
        projects={projects}
        members={members}
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditTask(null);
        }}
        onSave={updateTask}
      />
    </div>
  );
}
