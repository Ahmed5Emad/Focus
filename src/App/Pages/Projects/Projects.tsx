import { useState, useEffect } from "react";
import { Layout, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ProjectCard } from "./components/ProjectCard";
import type { Project } from "./components/ProjectCard";
import { CreateProjectModal } from "./components/CreateProjectModal";
import { EmptyProjectsState } from "./components/EmptyProjectsState";

export default function Projects() {
  const { user, currentWorkspaceId } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"active" | "completed" | "on_hold">("active");

  useEffect(() => {
    if (!user || !currentWorkspaceId) {
      setIsLoading(false);
      return;
    }
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentWorkspaceId]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("workspace_id", currentWorkspaceId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (newProject: { title: string; description: string; category: string }) => {
    if (!user || !currentWorkspaceId) return;

    try {
      const { data, error } = await supabase
        .from("projects")
        .insert([
          {
            title: newProject.title,
            description: newProject.description,
            category: newProject.category,
            user_id: user.id,
            workspace_id: currentWorkspaceId,
            status: "active",
          },
        ])
        .select()
        .single();



      if (error) throw error;
      if (data) {
        setProjects([data, ...projects]);
        toast.success("Project created");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    }
  };

  const handleUpdateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const { error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      setProjects(projects.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setProjects(projects.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const filteredProjects = projects.filter((p) => p.status === filter);

  return (
    <div className="page-container pt-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
        <div>
          <h1 className="page-title mb-2">
            Projects
          </h1>
          <p className="page-description">
            Manage your initiatives and track high-level progress.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="filter-tabs">
            {(["active", "completed", "on_hold"] as const).map((status) => (
              <button 
                key={status}
                onClick={() => setFilter(status)}
                className={`filter-tab ${
                  filter === status 
                    ? "filter-tab-active" 
                    : "filter-tab-inactive"
                }`}
              >
                {status.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {isLoading ? (
          <div className="col-span-1 md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Skeleton className="h-7 w-40" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full mt-3" />
                  <Skeleton className="h-4 w-3/4 mt-1.5" />
                  <Skeleton className="h-6 w-20 rounded-full mt-3" />
                </div>
                <div className="mt-auto pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyProjectsState onCreateProject={handleCreateProject} />
        ) : (
          <>
            {filteredProjects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onUpdate={handleUpdateProject} 
                onDelete={handleDeleteProject} 
              />
            ))}

            <div className="col-span-1 md:col-span-6 rounded-xl p-6 shadow-[0px_4px_12px_rgba(139,92,246,0.04)] border border-slate-100 bg-linear-to-br from-[#f5f3ff] to-[#ede9fe] flex flex-col justify-center items-center text-center hover:-translate-y-0.5 transition-transform duration-300 relative overflow-hidden group min-h-[200px]">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-[#7b68ee] via-transparent to-transparent"></div>
              <Layout className="w-12 h-12 text-[#7b68ee] mb-4" />
              <h3 className="font-['Spline_Sans',sans-serif] text-[24px] leading-[1.3] font-semibold text-slate-900 mb-2">
                Start a new project
              </h3>
              <p className="font-['Inter',sans-serif] text-[16px] leading-normal text-slate-600 mb-6">
                Ready to take on a new challenge? Create a project to get started.
              </p>
              <CreateProjectModal onCreate={handleCreateProject}>
                <button className="btn-primary z-10">
                  <Plus className="w-4 h-4" />
                  Create Project
                </button>
              </CreateProjectModal>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
