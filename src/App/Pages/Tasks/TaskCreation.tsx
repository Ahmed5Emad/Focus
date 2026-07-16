import { useState, useEffect } from 'react';
import { Plus, Calendar, Folder, CornerDownLeft, Sparkles, ListChecks, User, ArrowRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { type Priority } from "@/hooks/useTasks";
import { toast } from "sonner";
import { usePreferences } from "@/hooks/usePreferences";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dropdown } from "@/components/shared/Dropdown"
import { cn } from "@/lib/utils"
import { DatePicker } from "@/components/ui/date-picker"
import { Skeleton } from "@/components/ui/skeleton"

interface Project {
  id: string;
  title: string;
}

interface Task {
  id: string;
  title: string;
}

interface MemberProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  email?: string;
}

export default function TaskCreation() {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScheduledForToday, setIsScheduledForToday] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [parentTasks, setParentTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedParentTaskId, setSelectedParentTaskId] = useState<string | null>(null);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(null);
  const { user, currentWorkspaceId } = useAuth();
  const { preferences } = usePreferences();

  const [selectedPriority, setSelectedPriority] = useState<Priority>("none");
  const [dueDate, setDueDate] = useState<Date>();
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);

  const navigate = useNavigate();
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    if (preferences.autoAssignToSelf && user) {
      setSelectedAssigneeId(user.id);
    }
  }, [preferences.autoAssignToSelf, user]);

  useEffect(() => {
    if (!currentWorkspaceId) return;

    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const [projectsRes, tasksRes, memberRowsRes] = await Promise.all([
          supabase.from('projects').select('id, title').eq('workspace_id', currentWorkspaceId),
          supabase.from('tasks').select('id, title').eq('workspace_id', currentWorkspaceId).neq('status', 'done'),
          supabase.rpc('get_workspace_members_with_email', { p_workspace_id: currentWorkspaceId }),
        ]);

        if (projectsRes.data) setProjects(projectsRes.data);
        if (tasksRes.data) setParentTasks(tasksRes.data);

        const memberRowsData = (memberRowsRes.data ?? []) as Array<{ member_id: string; user_id: string; email: string; role: string; joined_at: string }>;
        const userIds = memberRowsData.map((r) => r.user_id);
        const emailMap = new Map<string, string>();
        memberRowsData.forEach((r) => emailMap.set(r.user_id, r.email));

        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url')
            .in('id', userIds);
          const profileMap = new Map((profiles ?? []).map(p => [p.id, p]));
          const merged = userIds.map(id => ({
              id,
              display_name: profileMap.get(id)?.display_name ?? (emailMap.get(id)?.split('@')[0] ?? null),
              avatar_url: profileMap.get(id)?.avatar_url ?? null,
              email: emailMap.get(id),
            }));
          setMembers(merged);
        }
      } catch (error) {
        console.error('Error fetching relationship data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [currentWorkspaceId, supabase, user?.id]);

  const createTask = async () => {
    if (!inputValue.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const taskStatus = preferences.defaultTaskStatus || "todo";
      const assigneeId = selectedAssigneeId ?? (preferences.autoAssignToSelf ? user?.id ?? null : null);
      const { error } = await supabase
        .from('tasks')
        .insert([{
          title: inputValue.trim(),
          status: taskStatus,
          workspace_id: currentWorkspaceId,
          user_id: user?.id,
          project_id: selectedProjectId,
          parent_task_id: selectedParentTaskId,
          assignee_id: assigneeId,
          priority: selectedPriority,
          due_date: dueDate?.toISOString() ?? null,
        }]);

      if (error) throw error;

      if (selectedAssigneeId && selectedAssigneeId !== user?.id) {
        await supabase.from('notifications').insert({
          user_id: selectedAssigneeId,
          workspace_id: currentWorkspaceId,
          type: 'assignment',
          title: 'You were assigned a task',
          body: inputValue.trim(),
          link: '/tasks',
        });
      }

      if (saveAsTemplate && user) {
        const { error: templateError } = await supabase
          .from('task_templates')
          .insert([{
            workspace_id: currentWorkspaceId,
            name: inputValue.trim(),
            task_title: inputValue.trim(),
            task_priority: selectedPriority,
            created_by: user.id,
          }]);
        if (templateError) {
          console.error('Error creating template:', templateError);
        } else {
          toast.success("Template saved");
        }
      }

      toast.success("Task created");
      setIsSubmitting(false);
      navigate('/tasks');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error("Failed to create task");
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate('/tasks');
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [navigate]);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      navigate('/tasks');
      return;
    }

    if (e.key === 'Enter' && inputValue.trim() && !isSubmitting) {
      await createTask();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full px-4">
      <div className="w-full max-w-2xl content-card overflow-hidden flex flex-col">
        <div className="bg-linear-to-br from-[#7c3aed] to-[#4f46e5] p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ListChecks className="w-32 h-32 rotate-12" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-white/80 font-['Space_Grotesk',sans-serif] text-sm font-medium tracking-wider uppercase">New Task</span>
          </div>
          <h2 className="font-['Spline_Sans',sans-serif] text-[32px] font-bold leading-tight text-white">
            Create New Task
          </h2>
          <p className="text-white/70 font-['Inter',sans-serif] text-base mt-2">
            Add a new task to stay focused and productive.
          </p>
        </div>

        <div className="px-8 pt-6 pb-2">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-white focus-within:border-[#7c3aed] focus-within:ring-[#7c3aed]/20 focus-within:ring-2 transition-all">
            <Plus className="text-slate-400 w-5 h-5 shrink-0" />
            <input
              autoFocus
              className="w-full bg-transparent border-none outline-none text-lg text-slate-900 placeholder:text-slate-400 focus:ring-0 p-0"
              placeholder="What needs to be done?"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-400 bg-slate-100 rounded border border-slate-200 shrink-0">
              Enter <CornerDownLeft className="w-3 h-3" />
            </kbd>
          </div>
        </div>

        <div className="overflow-y-auto px-8 pb-4 flex-1 bg-white">
          <div className="mb-4 pt-4">
            <div className="px-1 py-2 mb-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Actions</span>
            </div>

            {isLoadingData ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full rounded-lg" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                </div>
              </div>
            ) : (
            <div className="space-y-3">
            <button
              onClick={() => setIsScheduledForToday(!isScheduledForToday)}
              className={`w-full flex items-center justify-between p-3 rounded-lg text-slate-700 group transition-colors ${isScheduledForToday ? 'ring-2 ring-[#7c3aed] bg-[#f5f3ff]' : 'bg-white border border-slate-200 hover:border-[#7c3aed] hover:bg-slate-50'}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="font-medium text-sm">Schedule for Today {isScheduledForToday && <span className="text-[#7c3aed] font-semibold">(Scheduled)</span>}</span>
              </div>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">Project</label>
                <Dropdown
                  value={selectedProjectId}
                  onValueChange={setSelectedProjectId}
                  options={projects.map((p) => ({ value: p.id, label: p.title }))}
                  placeholder="Select project..."
                  searchPlaceholder="Search projects..."
                  emptyText="No project found."
                  noneLabel="No Project"
                  icon={<Folder className="w-4 h-4 text-purple-500" />}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">Assignee</label>
                <Dropdown
                  value={selectedAssigneeId}
                  onValueChange={setSelectedAssigneeId}
                  options={members.map((m) => ({ value: m.id, label: m.display_name ?? m.email ?? "Unknown" }))}
                  placeholder="Assign to..."
                  searchPlaceholder="Search members..."
                  emptyText="No member found."
                  noneLabel="Unassigned"
                  renderTrigger={(selected) => {
                    const member = selected ? members.find(m => m.id === selected.value) : null;
                    return (
                      <div className="flex items-center gap-2">
                        {member ? (
                          <>
                            <Avatar className="w-5 h-5">
                              <AvatarImage src={member.avatar_url ?? undefined} />
                              <AvatarFallback className="text-[9px]">{(member.display_name ?? "U").charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="truncate text-slate-700">{member.display_name}</span>
                          </>
                        ) : (
                          <>
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="truncate text-slate-500">Assign to...</span>
                          </>
                        )}
                      </div>
                    );
                  }}
                  renderOption={(option) => {
                    const member = members.find(m => m.id === option.value);
                    return (
                      <div className="flex items-center gap-2">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={member?.avatar_url ?? undefined} />
                          <AvatarFallback className="text-[9px]">{(member?.display_name ?? "U").charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {option.label}
                      </div>
                    );
                  }}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">Parent Task</label>
                <Dropdown
                  value={selectedParentTaskId}
                  onValueChange={setSelectedParentTaskId}
                  options={parentTasks.map((t) => ({ value: t.id, label: t.title }))}
                  placeholder="Select parent task..."
                  searchPlaceholder="Search tasks..."
                  emptyText="No task found."
                  noneLabel="No Parent Task"
                  icon={<ListChecks className="w-4 h-4 text-slate-400" />}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">Priority</label>
                <Dropdown
                  value={selectedPriority}
                  onValueChange={(val) => setSelectedPriority((val ?? "none") as Priority)}
                  options={[
                    { value: "none", label: "None" },
                    { value: "low", label: "Low" },
                    { value: "medium", label: "Medium" },
                    { value: "high", label: "High" },
                    { value: "urgent", label: "Urgent" },
                  ]}
                  showSearch={false}
                  renderTrigger={(selected) => (
                    <div className="flex items-center gap-2">
                      {selected && selected.value !== "none" && (
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          selected.value === "urgent" && "bg-red-500",
                          selected.value === "high" && "bg-orange-500",
                          selected.value === "medium" && "bg-blue-500",
                          selected.value === "low" && "bg-gray-400",
                        )} />
                      )}
                      <span className={selected && selected.value !== "none" ? "text-slate-700" : "text-slate-500"}>
                        {selected?.label ?? "No Priority"}
                      </span>
                    </div>
                  )}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">Due Date</label>
                <DatePicker
                  value={dueDate}
                  onChange={setDueDate}
                  placeholder="Pick a due date"
                />
              </div>
            </div>

            <div className="mt-3">
              <button
                type="button"
                onClick={() => setSaveAsTemplate(!saveAsTemplate)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg border transition-colors",
                  saveAsTemplate
                    ? "border-[#7c3aed] bg-[#f5f3ff] dark:bg-[#7c3aed]/10"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-transparent hover:border-[#7c3aed]/50",
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                  saveAsTemplate
                    ? "bg-[#7c3aed] border-[#7c3aed] text-white"
                    : "border-slate-300 dark:border-slate-600",
                )}>
                  {saveAsTemplate && (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Save as template</span>
                </div>
              </button>
            </div>
            </div>
            )}
          </div>
        </div>

        <div className="px-8 py-4 bg-white border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4 text-slate-400">
            <div className="flex items-center gap-1.5">
              <kbd className="text-[10px] font-medium bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">Esc</kbd>
              <span className="text-xs">Close</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="text-[10px] font-medium bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">↵</kbd>
              <span className="text-xs">Create Task</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/tasks')}
              className="h-10 px-5 rounded-xl font-['Space_Grotesk',sans-serif] font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={createTask}
              disabled={!inputValue.trim() || isSubmitting}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              <span className="font-['Space_Grotesk',sans-serif] font-bold tracking-wide uppercase text-xs">Create Task</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
