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
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  archived_at: string;
}

type ArchiveTab = "tasks" | "projects";

export default function ArchivePage() {
  const { currentWorkspaceId } = useAuth();
  const [supabase] = useState(() => createClient());
  const [activeTab, setActiveTab] = useState<ArchiveTab>("tasks");
  const [searchQuery, setSearchQuery] = useState("");
  const [tasks, setTasks] = useState<ArchivedTask[]>([]);
  const [projects, setProjects] = useState<ArchivedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentWorkspaceId) return;
    fetchArchived();
  }, [currentWorkspaceId]);

  const fetchArchived = async () => {
    setIsLoading(true);
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        supabase
          .from("tasks")
          .select("*, projects(title), goals(title)")
          .eq("workspace_id", currentWorkspaceId)
          .eq("is_archived", true)
          .order("updated_at", { ascending: false }),
        supabase
          .from("projects")
          .select("*")
          .eq("workspace_id", currentWorkspaceId)
          .eq("status", "archived")
          .order("updated_at", { ascending: false }),
      ]);

      if (!tasksRes.error) setTasks(tasksRes.data || []);
      if (!projectsRes.error) setProjects(projectsRes.data || []);
    } catch {
      // silently fail in mock mode
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (type: "tasks" | "projects", id: string) => {
    if (type === "tasks") {
      await supabase.from("tasks").update({ is_archived: false }).eq("id", id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } else {
      await supabase.from("projects").update({ status: "active" }).eq("id", id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleDelete = async (type: "tasks" | "projects", id: string) => {
    if (type === "tasks") {
      await supabase.from("tasks").delete().eq("id", id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } else {
      await supabase.from("projects").delete().eq("id", id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
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
    <div className="page-container pt-3">
      <div className="flex flex-col gap-0.5">
        <h1 className="page-title">Archive</h1>
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#494454]" />
          <Input
            placeholder={`Search archived ${activeTab}...`}
            className="pl-10 bg-white border-slate-100 h-10 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl shadow-[0px_4px_12px_rgba(139,92,246,0.04)] border border-slate-100 bg-white overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-[#ede9fe] border-t-[#7b68ee] rounded-full animate-spin" />
            <p className="font-['Inter',sans-serif] text-[16px] text-[#494454] font-medium">
              Loading archive...
            </p>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-24 h-24 bg-linear-to-br from-[#f5f3ff] to-[#ede9fe] rounded-3xl flex items-center justify-center mb-8 shadow-sm">
              <Archive className="w-12 h-12 text-[#7b68ee]" />
            </div>
            <h2 className="font-['Spline_Sans',sans-serif] text-[32px] font-bold text-[#0b1c30] mb-4 tracking-tight">
              {searchQuery
                ? "No archived items found"
                : "Nothing archived yet"}
            </h2>
            <p className="font-['Inter',sans-serif] text-[18px] leading-relaxed text-[#494454] max-w-lg">
              {searchQuery
                ? "Try a different search term."
                : `Completed or inactive ${activeTab === "tasks" ? "tasks" : "projects"} will appear here after archiving.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#f1f5f9]">
            {activeTab === "tasks"
              ? filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-center gap-4 p-5 hover:bg-[#f8f7fc] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#f1f5f9] flex items-center justify-center shrink-0">
                      <ListChecks className="w-5 h-5 text-[#64748b]" />
                    </div>

                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <h4 className="font-['Spline_Sans',sans-serif] text-[16px] font-semibold text-[#0b1c30] truncate">
                        {task.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        {task.projects?.title && (
                          <div className="flex items-center gap-1.5 text-[14px] text-[#494454]">
                            <Folder className="w-3.5 h-3.5 text-[#7b68ee]" />
                            <span>{task.projects.title}</span>
                          </div>
                        )}
                        {task.goals?.title && (
                          <div className="flex items-center gap-1.5 text-[14px] text-[#494454]">
                            <Target className="w-3.5 h-3.5 text-[#7b68ee]" />
                            <span>{task.goals.title}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-[14px] text-[#494454]">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(task.archived_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleRestore("tasks", task.id)}
                        className="h-8 w-8 rounded-lg text-[#494454] hover:text-cu-green"
                        title="Restore"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete("tasks", task.id)}
                        className="h-8 w-8 rounded-lg text-[#494454] hover:text-red-600"
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
                    className="group flex items-center gap-4 p-5 hover:bg-[#f8f7fc] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#f1f5f9] flex items-center justify-center shrink-0">
                      <Folder className="w-5 h-5 text-[#64748b]" />
                    </div>

                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <h4 className="font-['Spline_Sans',sans-serif] text-[16px] font-semibold text-[#0b1c30] truncate">
                        {project.title}
                      </h4>
                      <div className="flex items-center gap-x-4 gap-y-1">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                          {project.status}
                        </span>
                        <div className="flex items-center gap-1.5 text-[14px] text-[#494454]">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(project.archived_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleRestore("projects", project.id)}
                        className="h-8 w-8 rounded-lg text-[#494454] hover:text-cu-green"
                        title="Restore"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete("projects", project.id)}
                        className="h-8 w-8 rounded-lg text-[#494454] hover:text-red-600"
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
        <div className="mt-4 flex items-center justify-between px-2">
          <p className="font-['Inter',sans-serif] text-[14px] text-[#494454] font-medium">
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
