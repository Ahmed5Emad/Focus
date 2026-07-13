import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";

export type Priority = "none" | "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  created_at: string;
  due_date?: string | null;
  priority?: Priority;
  project_id?: string;
  goal_id?: string;
  assignee_id?: string;
  workspace_id: string;
  projects?: { title: string };
  goals?: { title: string };
  assignee?: { display_name: string | null; avatar_url: string | null } | null;
  is_archived?: boolean;
}

export interface Project {
  id: string;
  title: string;
}

export interface Goal {
  id: string;
  title: string;
}

export interface MemberProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  email?: string;
}

export function useTasks() {
  const { currentWorkspaceId } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [goalFilter, setGoalFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");

  const fetchMembers = useCallback(async () => {
    if (!currentWorkspaceId) return;
    try {
      const { data: memberRows } = await supabase
        .rpc("get_workspace_members_with_email", {
          p_workspace_id: currentWorkspaceId,
        });

      if (!memberRows || memberRows.length === 0) { setMembers([]); return; }

      const rows = memberRows as Array<{ member_id: string; user_id: string; email: string; role: string; joined_at: string }>;
      const userIds = rows.map((r) => r.user_id);
      const emailMap = new Map<string, string>();
      rows.forEach((r) => emailMap.set(r.user_id, r.email));

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", userIds);

      const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

      const merged: MemberProfile[] = userIds.map((id) => {
        const p = profileMap.get(id);
        return {
          id,
          display_name: p?.display_name ?? (emailMap.get(id)?.split('@')[0] ?? null),
          avatar_url: p?.avatar_url ?? null,
          email: emailMap.get(id),
        };
      });

      setMembers(merged);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  }, [currentWorkspaceId]);

  useEffect(() => {
    if (!currentWorkspaceId) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*, projects(title), goals!tasks_goal_id_fkey(title)')
          .eq('workspace_id', currentWorkspaceId)
          .is('is_archived', false)
          .order('created_at', { ascending: false });

        if (tasksError) throw tasksError;

        const assigneeIds = [...new Set((tasksData ?? []).map(t => t.assignee_id).filter(Boolean))] as string[];
        const profileMap = new Map<string, MemberProfile>();

        if (assigneeIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, display_name, avatar_url")
            .in("id", assigneeIds);
          (profiles ?? []).forEach(p => profileMap.set(p.id, p));
        }

        const enriched = (tasksData ?? []).map(t => ({
          ...t,
          assignee: t.assignee_id ? profileMap.get(t.assignee_id) ?? null : null,
        }));

        setTasks(enriched);

        const [projectsData, goalsData] = await Promise.all([
          supabase.from('projects').select('id, title').eq('workspace_id', currentWorkspaceId),
          supabase.from('goals').select('id, title').eq('workspace_id', currentWorkspaceId),
        ]);
        setProjects(projectsData.data || []);
        setGoals(goalsData.data || []);

      } catch (error) {
        console.error('Error fetching tasks data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    fetchMembers();

    const channel = supabase
      .channel(`tasks-hook-${currentWorkspaceId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `workspace_id=eq.${currentWorkspaceId}` }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentWorkspaceId, fetchMembers]);

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'todo' ? 'in_progress' : currentStatus === 'in_progress' ? 'done' : 'todo';
    try {
      const updates: Record<string, string | null> = { status: newStatus };
      if (newStatus === 'done') {
        updates.completed_at = new Date().toISOString();
      } else if (currentStatus === 'done') {
        updates.completed_at = null;
      }
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;
      setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updates } : t));
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<{ title: string; status: string; project_id: string | null; assignee_id: string | null; due_date: string | null; priority: Priority; is_archived: boolean; archived_at: string | null; updated_at: string }>) => {
    try {
      const dbUpdates: Record<string, string | boolean | null> = { ...updates };
      if (updates.status === 'done') {
        dbUpdates.completed_at = new Date().toISOString();
      } else if (updates.status && updates.status !== 'done') {
        const currentTask = tasks.find(t => t.id === taskId);
        if (currentTask?.status === 'done') {
          dbUpdates.completed_at = null;
        }
      }
      const { error } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', taskId);

      if (error) throw error;

      // Merge assignee profile for UI
      let newAssignee: Task["assignee"] = null;
      if (updates.assignee_id !== undefined) {
        if (updates.assignee_id) {
          const existing = members.find(m => m.id === updates.assignee_id);
          if (existing) {
            newAssignee = { display_name: existing.display_name, avatar_url: existing.avatar_url };
          }
        }
      }

      setTasks(tasks.map(t => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          ...dbUpdates,
          project_id: updates.project_id !== undefined ? updates.project_id : t.project_id,
          assignee: updates.assignee_id !== undefined ? newAssignee : t.assignee,
        } as Task;
      }));
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      return false;
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
      const matchesAssignee = assigneeFilter === "all" || task.assignee_id === assigneeFilter;
      const notArchived = !task.is_archived;

      return matchesSearch && matchesStatus && matchesProject && matchesGoal && matchesAssignee && notArchived;
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
  };
}
