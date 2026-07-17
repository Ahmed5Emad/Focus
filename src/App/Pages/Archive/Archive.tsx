import { useState, useEffect } from "react";
import {
  Archive,
  Search,
  RotateCcw,
  Trash2,
  Folder,
  ListChecks,
  Calendar,
  Target,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";

interface ArchivedTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  archived_at: string;
  project_id?: string;
  goal_id?: string;
  projects?: { title: string };
  goals?: { title: string };
}

interface ArchivedProject {
  id: string;
  title: string;
  description?: string;
  status: string;
  created_at: string;
}

type ArchiveTab = "tasks" | "projects";

export default function ArchivePage() {
  const { currentWorkspaceId } = useAuth();
  const [activeTab, setActiveTab] = useState<ArchiveTab>("tasks");
  const [searchQuery, setSearchQuery] = useState("");
  const [tasks, setTasks] = useState<ArchivedTask[]>([]);
  const [projects, setProjects] = useState<ArchivedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentWorkspaceId) {
      setIsLoading(false);
      return;
    }
    fetchArchived();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkspaceId]);

  const fetchArchived = async () => {
    setIsLoading(true);
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        supabase
          .from("tasks")
          .select("*, projects(title), goals!tasks_goal_id_fkey(title)")
          .eq("workspace_id", currentWorkspaceId)
          .eq("is_archived", true)
          .order("updated_at", { ascending: false }),
        supabase
          .from("projects")
          .select("*")
          .eq("workspace_id", currentWorkspaceId)
          .eq("status", "archived")
          .order("created_at", { ascending: false }),
      ]);

      if (tasksRes.error) console.error("Error fetching archived tasks:", tasksRes.error);
      else setTasks(tasksRes.data || []);
      if (projectsRes.error) console.error("Error fetching archived projects:", projectsRes.error);
      else setProjects(projectsRes.data || []);
    } catch (error) {
      console.error("Error fetching archived items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (type: "tasks" | "projects", id: string) => {
    try {
      if (type === "tasks") {
        await supabase.from("tasks").update({ is_archived: false, archived_at: null, updated_at: new Date().toISOString() }).eq("id", id);
        setTasks((prev) => prev.filter((t) => t.id !== id));
      } else {
        await supabase.from("projects").update({ status: "active" }).eq("id", id);
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
      toast.success(`${type === "tasks" ? "Task" : "Project"} restored`);
    } catch (error) {
      console.error("Error restoring item:", error);
      toast.error("Failed to restore item");
    }
  };

  const handleDelete = async (type: "tasks" | "projects", id: string) => {
    try {
      if (type === "tasks") {
        await supabase.from("tasks").delete().eq("id", id);
        setTasks((prev) => prev.filter((t) => t.id !== id));
      } else {
        await supabase.from("projects").delete().eq("id", id);
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
      toast.success(`${type === "tasks" ? "Task" : "Project"} permanently deleted`);
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const isEmpty =
    activeTab === "tasks"
      ? filteredTasks.length === 0
      : filteredProjects.length === 0;

  return (
    <div className="page-container pt-3 px-4 sm:px-6">
      <div className="flex flex-col gap-0.5">
        <h1 className="page-title text-xl sm:text-2xl md:text-3xl">Archive</h1>
        <p className="page-description">
          View and manage your archived tasks and projects.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
        <div className="filter-tabs">
          <button
            onClick={() => setActiveTab("tasks")}
            className={`filter-tab ${activeTab === "tasks" ? "filter-tab-active" : "filter-tab-inactive"}`}
          >
            Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`filter-tab ${activeTab === "projects" ? "filter-tab-active" : "filter-tab-inactive"}`}
          >
            Projects ({projects.length})
          </button>
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <Input
            placeholder={`Search archived ${activeTab}...`}
            className="pl-10 bg-white border-slate-100 h-10 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl shadow-[0px_4px_12px_rgba(139,92,246,0.04)] border border-slate-100 bg-white overflow-hidden px-1 sm:px-0">
        {isLoading ? (
          <div className="divide-y divide-slate-200">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 md:p-5">
                <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <Skeleton className="w-8 h-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : isEmpty ? (
          <EmptyState
            icon={Archive}
            title={searchQuery ? "No archived items found" : "Nothing archived yet"}
            description={searchQuery ? "Try adjusting your filters." : "Items you archive will appear here."}
          />
        ) : (
          <div className="divide-y divide-slate-200">
            {activeTab === "tasks"
              ? filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 md:p-5 hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                        <ListChecks className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                    </div>

                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <h4 className="font-['Spline_Sans',sans-serif] text-sm sm:text-base md:text-[16px] font-semibold text-slate-900 truncate">
                        {task.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        {task.projects?.title && (
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm md:text-[14px] text-slate-600">
                            <Folder className="w-3.5 h-3.5 text-primary" />
                            <span>{task.projects.title}</span>
                          </div>
                        )}
                        {task.goals?.title && (
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm md:text-[14px] text-slate-600">
                            <Target className="w-3.5 h-3.5 text-primary" />
                            <span>{task.goals.title}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm md:text-[14px] text-slate-600">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(task.archived_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleRestore("tasks", task.id)}
                        className="h-8 w-8 min-h-9 min-w-9 sm:min-h-8 sm:min-w-8 rounded-lg text-slate-600 hover:text-cu-green"
                        title="Restore"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete("tasks", task.id)}
                        className="h-8 w-8 min-h-9 min-w-9 sm:min-h-8 sm:min-w-8 rounded-lg text-slate-600 hover:text-red-600"
                        title="Delete permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              : filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 md:p-5 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      <Folder className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                    </div>

                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <h4 className="font-['Spline_Sans',sans-serif] text-sm sm:text-base md:text-[16px] font-semibold text-slate-900 truncate">
                        {project.title}
                      </h4>
                      <div className="flex items-center gap-x-4 gap-y-1">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs sm:text-sm md:text-[14px] font-bold uppercase tracking-wider">
                          {project.status}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm md:text-[14px] text-slate-600">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(project.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleRestore("projects", project.id)}
                        className="h-8 w-8 min-h-9 min-w-9 sm:min-h-8 sm:min-w-8 rounded-lg text-slate-600 hover:text-cu-green"
                        title="Restore"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete("projects", project.id)}
                        className="h-8 w-8 min-h-9 min-w-9 sm:min-h-8 sm:min-w-8 rounded-lg text-slate-600 hover:text-red-600"
                        title="Delete permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
          </div>
        )}
      </div>

      {!isLoading && !isEmpty && (
        <div className="mt-3 flex items-center justify-between px-2">
          <p className="font-['Inter',sans-serif] text-xs sm:text-sm md:text-[14px] text-slate-600 font-medium">
            Showing{" "}
            {activeTab === "tasks"
              ? filteredTasks.length
              : filteredProjects.length}{" "}
            archived {activeTab === "tasks" ? "tasks" : "projects"}
          </p>
        </div>
      )}
    </div>
  );
}
