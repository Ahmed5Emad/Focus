import { 
  CheckSquare, 
  Filter, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Calendar, 
  Folder, 
  Target,
  CheckCircle2,
  Circle,
  Trash2,
  ArrowUpDown
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTasks } from "@/hooks/useTasks";

export default function Tasks() {
  const {
    tasks,
    projects,
    goals,
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    projectFilter,
    setProjectFilter,
    goalFilter,
    setGoalFilter,
    sortBy,
    setSortBy,
    filteredTasks,
    toggleTaskStatus,
    deleteTask
  } = useTasks();


  return (
    <div className="page-container">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-6">
        <div className="flex flex-col gap-1">
          <h1 className="page-title">Tasks</h1>
          <p className="font-['Spline_Sans',sans-serif] font-normal text-[#64748b] text-[16px] leading-[25.6px] m-0">
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

      <div className="bg-white border border-[#f1f5f9] rounded-2xl shadow-sm p-2 flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search tasks..."
            className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-all h-10 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] bg-slate-50 border-slate-200 h-10 rounded-xl">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-[160px] bg-slate-50 border-slate-200 h-10 rounded-xl">
              <div className="flex items-center gap-2">
                <Folder className="w-3.5 h-3.5 text-purple-500" />
                <SelectValue placeholder="Project" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={goalFilter} onValueChange={setGoalFilter}>
            <SelectTrigger className="w-[160px] bg-slate-50 border-slate-200 h-10 rounded-xl">
              <div className="flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-blue-500" />
                <SelectValue placeholder="Goal" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Goals</SelectItem>
              {goals.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="h-6 w-px bg-slate-200 mx-1 hidden lg:block" />

          <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
            <SelectTrigger className="w-[140px] bg-slate-50 border-slate-200 h-10 rounded-xl">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <SelectValue placeholder="Sort by" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white border border-[#f1f5f9] rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin" />
            <p className="text-slate-500 font-medium">Loading your tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <CheckSquare className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              No tasks found
            </h3>
            <p className="text-slate-500 max-w-xs mx-auto mb-6">
              {searchQuery ||
              statusFilter !== "all" ||
              projectFilter !== "all" ||
              goalFilter !== "all"
                ? "Try adjusting your filters to find what you're looking for."
                : "Start by creating your first task to stay focused and productive."}
            </p>
            <Link to="/tasks/new">
              <Button
                variant="outline"
                className="rounded-xl border-slate-200 hover:bg-slate-50"
              >
                Create New Task
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#f1f5f9]">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="group flex items-center gap-4 p-5 hover:bg-slate-50/50 transition-colors relative"
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
                      : "border-slate-300 hover:border-purple-400 bg-white",
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
                        "font-medium text-[16px] leading-tight truncate",
                        task.status === "done"
                          ? "text-slate-400 line-through"
                          : "text-slate-800",
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
                    {task.projects?.title && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Folder className="w-3 h-3 text-purple-400" />
                        <span>{task.projects.title}</span>
                      </div>
                    )}
                    {task.goals?.title && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Target className="w-3 h-3 text-blue-400" />
                        <span>{task.goals.title}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Calendar className="w-3 h-3" />
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
                        className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-40 rounded-xl"
                    >
                      <DropdownMenuItem
                        className="text-slate-600 cursor-pointer"
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
          <p className="text-xs text-slate-500 font-medium">
            Showing {filteredTasks.length}{" "}
            {filteredTasks.length === 1 ? "task" : "tasks"}
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-500">
                {tasks.filter((t) => t.status === "done").length} Completed
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-slate-300" />
              <span className="text-xs text-slate-500">
                {tasks.filter((t) => t.status !== "done").length} Remaining
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
