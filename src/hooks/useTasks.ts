import { useState, useEffect, useCallback, useRef } from "react";
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
  parent_task_id?: string | null;
  position?: number;
  projects?: { title: string };
  goals?: { title: string };
  assignee?: { display_name: string | null; avatar_url: string | null } | null;
  is_archived?: boolean;
  total_time_seconds?: number;
  subtask_count?: number;
  dependency_count?: number;
  recurrence_rule?: string | null;
  recurrence_end_date?: string | null;
  last_recurrence_at?: string | null;
  template_id?: string | null;
}

export interface TaskTemplate {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  task_title: string;
  task_description?: string;
  task_priority: string;
  subtask_templates: Array<{ title: string }>;
  created_at: string;
  created_by: string;
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

export interface TaskDependency {
  id: string;
  task_id: string;
  depends_on_task_id: string;
  created_at: string;
  depends_on_task?: { title: string } | null;
}

export interface WorkflowStatus {
  id: string;
  workspace_id: string;
  name: string;
  color: string;
  position: number;
  is_default: boolean;
}

export interface CustomField {
  id: string;
  workspace_id: string;
  name: string;
  field_type: string;
  options: string[];
  position: number;
}

export interface TaskCustomValue {
  id: string;
  task_id: string;
  field_id: string;
  value: string | null;
}

export function useTasks() {
  const { currentWorkspaceId } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [workflowStatuses, setWorkflowStatuses] = useState<WorkflowStatus[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [taskCustomValues, setTaskCustomValues] = useState<Record<string, TaskCustomValue[]>>({});

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

  const fetchWorkflowConfig = useCallback(async () => {
    if (!currentWorkspaceId) return;
    const [statusesRes, fieldsRes] = await Promise.all([
      supabase.from('workflow_statuses').select('*').eq('workspace_id', currentWorkspaceId).order('position'),
      supabase.from('custom_fields').select('*').eq('workspace_id', currentWorkspaceId).order('position'),
    ]);
    setWorkflowStatuses(statusesRes.data ?? []);
    setCustomFields(fieldsRes.data ?? []);
  }, [currentWorkspaceId]);

  const addWorkflowStatus = async (name: string, color: string) => {
    if (!currentWorkspaceId) return false;
    try {
      const { error } = await supabase
        .from('workflow_statuses')
        .insert({ workspace_id: currentWorkspaceId, name, color, position: workflowStatuses.length });
      if (error) throw error;
      await fetchWorkflowConfig();
      return true;
    } catch (error) {
      console.error('Error adding workflow status:', error);
      return false;
    }
  };

  const updateWorkflowStatus = async (id: string, updates: Partial<WorkflowStatus>) => {
    try {
      const { error } = await supabase
        .from('workflow_statuses')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
      await fetchWorkflowConfig();
      return true;
    } catch (error) {
      console.error('Error updating workflow status:', error);
      return false;
    }
  };

  const deleteWorkflowStatus = async (id: string) => {
    try {
      const { error } = await supabase
        .from('workflow_statuses')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchWorkflowConfig();
      return true;
    } catch (error) {
      console.error('Error deleting workflow status:', error);
      return false;
    }
  };

  const addCustomField = async (field: Omit<CustomField, 'id'>) => {
    if (!currentWorkspaceId) return false;
    try {
      const { error } = await supabase
        .from('custom_fields')
        .insert({ ...field, workspace_id: currentWorkspaceId });
      if (error) throw error;
      await fetchWorkflowConfig();
      return true;
    } catch (error) {
      console.error('Error adding custom field:', error);
      return false;
    }
  };

  const deleteCustomField = async (id: string) => {
    try {
      const { error } = await supabase
        .from('custom_fields')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchWorkflowConfig();
      return true;
    } catch (error) {
      console.error('Error deleting custom field:', error);
      return false;
    }
  };

  const setCustomFieldValue = async (taskId: string, fieldId: string, value: string | null) => {
    try {
      const { error } = await supabase
        .from('task_custom_values')
        .upsert({ task_id: taskId, field_id: fieldId, value }, { onConflict: 'task_id, field_id' });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error setting custom field value:', error);
      return false;
    }
  };

  const getCustomFieldValues = async (taskId: string): Promise<TaskCustomValue[]> => {
    try {
      const { data } = await supabase
        .from('task_custom_values')
        .select('*')
        .eq('task_id', taskId);
      return data ?? [];
    } catch (error) {
      console.error('Error fetching custom field values:', error);
      return [];
    }
  };

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
          .order('position', { ascending: true, nullsFirst: false })
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

        const { data: sessions } = await supabase
          .from('focus_sessions')
          .select('task_id, actual_duration_seconds')
          .eq('workspace_id', currentWorkspaceId);

        const timeMap = new Map<string, number>();
        if (sessions) {
          for (const s of sessions) {
            if (s.actual_duration_seconds) {
              timeMap.set(s.task_id, (timeMap.get(s.task_id) ?? 0) + s.actual_duration_seconds);
            }
          }
        }

        const [{ data: subtaskCountsData }, { data: dependencyCountsData }] = await Promise.all([
          supabase
            .from('tasks')
            .select('parent_task_id')
            .is('is_archived', false)
            .not('parent_task_id', 'is', null),
          supabase
            .from('task_dependencies')
            .select('task_id'),
        ]);

        const subtaskCountMap = new Map<string, number>();
        (subtaskCountsData ?? []).forEach(t => {
          if (t.parent_task_id) {
            subtaskCountMap.set(t.parent_task_id, (subtaskCountMap.get(t.parent_task_id) ?? 0) + 1);
          }
        });

        const dependencyCountMap = new Map<string, number>();
        (dependencyCountsData ?? []).forEach(d => {
          dependencyCountMap.set(d.task_id, (dependencyCountMap.get(d.task_id) ?? 0) + 1);
        });

        const enriched = (tasksData ?? []).map(t => ({
          ...t,
          assignee: t.assignee_id ? profileMap.get(t.assignee_id) ?? null : null,
          total_time_seconds: timeMap.get(t.id) ?? 0,
          subtask_count: subtaskCountMap.get(t.id) ?? 0,
          dependency_count: dependencyCountMap.get(t.id) ?? 0,
        }));

        setTasks(enriched);

        const taskIds = enriched.map(t => t.id);
        if (taskIds.length > 0) {
          const { data: cvData } = await supabase
            .from('task_custom_values')
            .select('*')
            .in('task_id', taskIds);
          const cvMap: Record<string, TaskCustomValue[]> = {};
          (cvData ?? []).forEach(cv => {
            if (!cvMap[cv.task_id]) cvMap[cv.task_id] = [];
            cvMap[cv.task_id].push(cv);
          });
          setTaskCustomValues(cvMap);
        }

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
    fetchWorkflowConfig();

    const chName = `tasks-${currentWorkspaceId}`;
    const ch = supabase.channel(chName);
    try { ch.on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `workspace_id=eq.${currentWorkspaceId}` }, () => { fetchData(); }); } catch {}
    ch.subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [currentWorkspaceId, fetchMembers]);

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    let newStatus: string;
    if (workflowStatuses.length > 0) {
      const idx = workflowStatuses.findIndex(s => s.name === currentStatus);
      if (idx === -1 || idx >= workflowStatuses.length - 1) {
        newStatus = workflowStatuses[0].name;
      } else {
        newStatus = workflowStatuses[idx + 1].name;
      }
    } else {
      newStatus = currentStatus === 'todo' ? 'in_progress' : currentStatus === 'in_progress' ? 'done' : 'todo';
    }
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

      if (newStatus === 'done') {
        const task = tasks.find(t => t.id === taskId);
        if (task?.recurrence_rule) {
          await generateRecurringTask(taskId);
        }
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<{ title: string; status: string; project_id: string | null; assignee_id: string | null; due_date: string | null; priority: Priority; is_archived: boolean; archived_at: string | null; updated_at: string }>) => {
    try {
      const dbUpdates: Record<string, string | boolean | null> = { ...updates };
      const isTerminalStatus = workflowStatuses.length > 0
        ? updates.status === workflowStatuses[workflowStatuses.length - 1].name
        : updates.status === 'done';
      if (isTerminalStatus) {
        dbUpdates.completed_at = new Date().toISOString();
      } else if (updates.status) {
        const currentTask = tasks.find(t => t.id === taskId);
        const wasTerminal = workflowStatuses.length > 0
          ? currentTask?.status === workflowStatuses[workflowStatuses.length - 1].name
          : currentTask?.status === 'done';
        if (wasTerminal) {
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
        .update({ is_archived: true, archived_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', taskId);

      if (error) throw error;
      setTasks(tasks.filter(t => t.id !== taskId));
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  };

  const undeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_archived: false, archived_at: null })
        .eq('id', taskId);

      if (error) throw error;

      const restoredTask = tasks.find(t => t.id === taskId);
      if (restoredTask) {
        setTasks([...tasks, { ...restoredTask, is_archived: false, archived_at: null }]);
      } else {
        const { data } = await supabase
          .from('tasks')
          .select('*, projects(title), goals!tasks_goal_id_fkey(title)')
          .eq('id', taskId)
          .single();
        if (data) {
          setTasks([...tasks, data as Task]);
        }
      }
      return true;
    } catch (error) {
      console.error('Error restoring task:', error);
      return false;
    }
  };

  const fetchSubtasks = useCallback(async (taskId: string): Promise<Task[]> => {
    if (!currentWorkspaceId) return [];
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, projects(title), goals!tasks_goal_id_fkey(title)')
        .eq('parent_task_id', taskId)
        .is('is_archived', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Task[];
    } catch (error) {
      console.error('Error fetching subtasks:', error);
      return [];
    }
  }, [currentWorkspaceId]);

  const setParentTask = useCallback(async (taskId: string, parentTaskId: string | null) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ parent_task_id: parentTaskId })
        .eq('id', taskId);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error setting parent task:', error);
      return false;
    }
  }, []);

  const addDependency = useCallback(async (taskId: string, dependsOnTaskId: string) => {
    try {
      const { error } = await supabase
        .from('task_dependencies')
        .insert({ task_id: taskId, depends_on_task_id: dependsOnTaskId });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding dependency:', error);
      return false;
    }
  }, []);

  const removeDependency = useCallback(async (taskId: string, dependsOnTaskId: string) => {
    try {
      const { error } = await supabase
        .from('task_dependencies')
        .delete()
        .eq('task_id', taskId)
        .eq('depends_on_task_id', dependsOnTaskId);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing dependency:', error);
      return false;
    }
  }, []);

  const fetchDependencies = useCallback(async (taskId: string): Promise<TaskDependency[]> => {
    if (!currentWorkspaceId) return [];
    try {
      const { data } = await supabase
        .from('task_dependencies')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (!data || data.length === 0) return [];

      const depTaskIds = [...new Set(data.map(d => d.depends_on_task_id))];
      const { data: depTasks } = await supabase
        .from('tasks')
        .select('id, title')
        .in('id', depTaskIds);

      const titleMap = new Map(depTasks?.map(t => [t.id, t.title]) ?? []);

      return data.map(d => ({
        ...d,
        depends_on_task: { title: titleMap.get(d.depends_on_task_id) ?? 'Unknown' },
      }));
    } catch (error) {
      console.error('Error fetching dependencies:', error);
      return [];
    }
  }, [currentWorkspaceId]);

  const [templates, setTemplates] = useState<TaskTemplate[]>([]);

  const fetchTemplates = useCallback(async () => {
    if (!currentWorkspaceId) return;
    try {
      const { data } = await supabase
        .from('task_templates')
        .select('*')
        .eq('workspace_id', currentWorkspaceId)
        .order('created_at', { ascending: false });
      setTemplates(data ?? []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  }, [currentWorkspaceId]);

  const createTemplate = async (template: Omit<TaskTemplate, 'id' | 'created_at' | 'workspace_id'>) => {
    if (!currentWorkspaceId) return false;
    try {
      const { error } = await supabase
        .from('task_templates')
        .insert([{ ...template, workspace_id: currentWorkspaceId }]);
      if (error) throw error;
      await fetchTemplates();
      return true;
    } catch (error) {
      console.error('Error creating template:', error);
      return false;
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('task_templates')
        .delete()
        .eq('id', templateId);
      if (error) throw error;
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      return true;
    } catch (error) {
      console.error('Error deleting template:', error);
      return false;
    }
  };

  const applyTemplate = async (templateId: string) => {
    if (!currentWorkspaceId || !currentWorkspaceId) return null;
    try {
      const { data: template } = await supabase
        .from('task_templates')
        .select('*')
        .eq('id', templateId)
        .single();
      if (!template) return null;

      const { data: newTask, error } = await supabase
        .from('tasks')
        .insert([{
          title: template.task_title,
          description: template.task_description ?? null,
          priority: template.task_priority === 'none' ? null : template.task_priority,
          status: 'todo',
          workspace_id: currentWorkspaceId,
          template_id: templateId,
        }])
        .select()
        .single();

      if (error) throw error;
      return newTask as Task;
    } catch (error) {
      console.error('Error applying template:', error);
      return null;
    }
  };

  const generateRecurringTask = async (taskId: string) => {
    if (!currentWorkspaceId) return null;
    try {
      const { data: task } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();
      if (!task || !task.recurrence_rule) return null;

      if (task.recurrence_end_date && new Date(task.recurrence_end_date) < new Date()) return null;

      const baseDate = task.due_date ? new Date(task.due_date) : new Date();
      let nextDueDate: Date;

      switch (task.recurrence_rule) {
        case 'daily':
          nextDueDate = new Date(baseDate);
          nextDueDate.setDate(nextDueDate.getDate() + 1);
          break;
        case 'weekly':
          nextDueDate = new Date(baseDate);
          nextDueDate.setDate(nextDueDate.getDate() + 7);
          break;
        case 'monthly':
          nextDueDate = new Date(baseDate);
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          break;
        default:
          return null;
      }

      const { error: insertError } = await supabase
        .from('tasks')
        .insert([{
          title: task.title,
          description: task.description,
          status: 'todo',
          priority: task.priority,
          project_id: task.project_id,
          goal_id: task.goal_id,
          assignee_id: task.assignee_id,
          workspace_id: currentWorkspaceId,
          parent_task_id: task.parent_task_id,
          due_date: nextDueDate.toISOString(),
          recurrence_rule: task.recurrence_rule,
          recurrence_end_date: task.recurrence_end_date,
          template_id: task.template_id,
        }]);

      if (insertError) throw insertError;

      await supabase
        .from('tasks')
        .update({ last_recurrence_at: new Date().toISOString() })
        .eq('id', taskId);

      return true;
    } catch (error) {
      console.error('Error generating recurring task:', error);
      return null;
    }
  };

  const updateTaskRecurrence = async (taskId: string, rule: string | null, endDate?: string | null) => {
    try {
      const updates: Record<string, string | null> = {
        recurrence_rule: rule,
        recurrence_end_date: endDate ?? null,
      };
      if (!rule) {
        updates.last_recurrence_at = null;
      }
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);
      if (error) throw error;
      setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updates } as Task : t));
      return true;
    } catch (error) {
      console.error('Error updating recurrence:', error);
      return false;
    }
  };

  const reorderTask = async (taskId: string, newPosition: number) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, position: newPosition } : t));
    try {
      await supabase
        .from('tasks')
        .update({ position: newPosition })
        .eq('id', taskId);
    } catch (error) {
      console.error('Error reordering task:', error);
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
    undeleteTask,
    fetchSubtasks,
    setParentTask,
    addDependency,
    removeDependency,
    fetchDependencies,
    templates,
    fetchTemplates,
    createTemplate,
    deleteTemplate,
    applyTemplate,
    generateRecurringTask,
    updateTaskRecurrence,
    reorderTask,
    workflowStatuses,
    customFields,
    taskCustomValues,
    fetchWorkflowConfig,
    addWorkflowStatus,
    updateWorkflowStatus,
    deleteWorkflowStatus,
    addCustomField,
    deleteCustomField,
    setCustomFieldValue,
    getCustomFieldValues,
  };
}
