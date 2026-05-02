import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  created_at: string;
  project_id?: string;
  goal_id?: string;
  workspace_id: string;
  projects?: { title: string };
  goals?: { title: string };
}

export interface Project {
  id: string;
  title: string;
}

export interface Goal {
  id: string;
  title: string;
}

export function useTasks() {
  const { currentWorkspaceId } = useAuth();
  const supabase = createClient();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [goalFilter, setGoalFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");

  useEffect(() => {
    if (!currentWorkspaceId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*, projects(title), goals(title)')
          .eq('workspace_id', currentWorkspaceId)
          .order('created_at', { ascending: false });

        if (tasksError) throw tasksError;
        setTasks(tasksData || []);

        const { data: projectsData } = await supabase
          .from('projects')
          .select('id, title')
          .eq('workspace_id', currentWorkspaceId);
        setProjects(projectsData || []);

        const { data: goalsData } = await supabase
          .from('goals')
          .select('id, title')
          .eq('workspace_id', currentWorkspaceId);
        setGoals(goalsData || []);

      } catch (error) {
        console.error('Error fetching tasks data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const channel = supabase
      .channel('tasks-hook-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentWorkspaceId, supabase]);

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);
      
      if (error) throw error;
      
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
      
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const filteredTasks = tasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesProject = projectFilter === "all" || task.project_id === projectFilter;
      const matchesGoal = goalFilter === "all" || task.goal_id === goalFilter;
      
      return matchesSearch && matchesStatus && matchesProject && matchesGoal;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return 0;
    });

  return {
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
  };
}
