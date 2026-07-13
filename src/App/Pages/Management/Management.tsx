import { useState, useEffect } from "react";
import {
  Target,
  Users,
  ListChecks,
  CheckCircle2,
  TrendingUp,
  Folder,
  Plus,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

interface TaskCounts {
  total: number;
  todo: number;
  in_progress: number;
  done: number;
}

interface MemberWithCounts {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  email?: string;
  taskCount: number;
  completedCount: number;
}

export default function Management() {
  const { currentWorkspaceId } = useAuth();
  const [supabase] = useState(() => createClient());
  const [isLoading, setIsLoading] = useState(true);
  const [taskCounts, setTaskCounts] = useState<TaskCounts>({ total: 0, todo: 0, in_progress: 0, done: 0 });
  const [members, setMembers] = useState<MemberWithCounts[]>([]);

  useEffect(() => {
    if (!currentWorkspaceId) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkspaceId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [tasksRes, membersRes] = await Promise.all([
        supabase
          .from("tasks")
          .select("id, status, assignee_id")
          .eq("workspace_id", currentWorkspaceId),
        supabase.rpc("get_workspace_members_with_email", {
          p_workspace_id: currentWorkspaceId,
        }),
      ]);

      if (!tasksRes.error && tasksRes.data) {
        const tasks = tasksRes.data as { id: string; status: string; assignee_id: string | null }[];
        setTaskCounts({
          total: tasks.length,
          todo: tasks.filter((t) => t.status === "todo").length,
          in_progress: tasks.filter((t) => t.status === "in_progress").length,
          done: tasks.filter((t) => t.status === "done").length,
        });

        if (!membersRes.error && membersRes.data) {
          const memberRows = membersRes.data as { member_id: string; user_id: string; email: string }[];
          const userIds = memberRows.map((r) => r.user_id);
          const emailMap = new Map(memberRows.map((r) => [r.user_id, r.email]));

          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, display_name, avatar_url")
            .in("id", userIds);

          type ProfileRow = { id: string; display_name: string | null; avatar_url: string | null };
          const profileRows = (profiles ?? []) as ProfileRow[];
          const profileMap = new Map(profileRows.map((p) => [p.id, p]));

          const membersWithCounts: MemberWithCounts[] = userIds.map((id) => {
            const p = profileMap.get(id) as ProfileRow | undefined;
            return {
              id,
              display_name: p?.display_name ?? (emailMap.get(id)?.split("@")[0] ?? null),
              avatar_url: p?.avatar_url ?? null,
              email: emailMap.get(id),
              taskCount: tasks.filter((t) => t.assignee_id === id).length,
              completedCount: tasks.filter((t) => t.assignee_id === id && t.status === "done").length,
            };
          });

          setMembers(membersWithCounts);
        }
      }
    } catch {
      // silently fail in mock mode
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      label: "Total Tasks",
      value: taskCounts.total,
      icon: ListChecks,
      color: "bg-[#f5f3ff]",
      iconColor: "text-primary",
    },
    {
      label: "In Progress",
      value: taskCounts.in_progress,
      icon: TrendingUp,
      color: "bg-[#eff6ff]",
      iconColor: "text-[#3b82f6]",
    },
    {
      label: "Completed",
      value: taskCounts.done,
      icon: CheckCircle2,
      color: "bg-[#ecfdf5]",
      iconColor: "text-[#10b981]",
    },
    {
      label: "Team Members",
      value: members.length,
      icon: Users,
      color: "bg-[#fef2f2]",
      iconColor: "text-[#ef4444]",
    },
  ];

  return (
    <div className="page-container pt-3">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-3">
        <div className="flex flex-col gap-0.5">
          <h1 className="page-title">Management</h1>
          <p className="page-description">
            Overview of your team's workload and task distribution.
          </p>
        </div>
        <Link to="/tasks/new">
          <Button className="btn-primary">
            <ListChecks className="w-4 h-4" />
            <span className="font-semibold tracking-wide uppercase text-[12px]">New Task</span>
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-xl shadow-sm p-5">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-8 w-16 mt-3" />
                <Skeleton className="h-4 w-20 mt-1" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-xl shadow-sm p-6">
              <Skeleton className="h-4 w-48 mb-6" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
            <div className="bg-white border border-slate-100 rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100">
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="divide-y divide-slate-200">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-36 mt-1" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-4 w-10" />
                      <Skeleton className="h-4 w-10" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : taskCounts.total === 0 ? (
        <div className="content-card flex flex-col items-center justify-center py-24 px-6">
          <div className="max-w-md text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-linear-to-br from-[#f5f3ff] to-[#ede9fe] rounded-3xl flex items-center justify-center mb-8 shadow-sm">
              <Target className="w-12 h-12 text-primary" />
            </div>
            <h2 className="font-['Spline_Sans',sans-serif] text-[32px] font-bold text-slate-900 mb-4 tracking-tight">
              No active tasks or goals
            </h2>
            <p className="font-['Inter',sans-serif] text-[18px] leading-relaxed text-slate-600 max-w-lg mb-6">
              Get started by creating your first task or goal to manage your workflow and track team progress.
            </p>
            <Link to="/tasks/new">
              <Button className="btn-primary">
                <Plus className="w-4 h-4" />
                Create New Task
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white border border-slate-100 rounded-xl shadow-sm p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-['Spline_Sans',sans-serif] font-semibold text-slate-700 text-[12px] tracking-[1.2px] uppercase">
                  Task Distribution by Status
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    { label: "To Do", count: taskCounts.todo, color: "bg-[#94a3b8]" },
                    { label: "In Progress", count: taskCounts.in_progress, color: "bg-[#3b82f6]" },
                    { label: "Done", count: taskCounts.done, color: "bg-[#10b981]" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-slate-900">{item.label}</span>
                        <span className="text-sm text-slate-500">
                          {item.count} / {taskCounts.total}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                          style={{
                            width: `${taskCounts.total > 0 ? (item.count / taskCounts.total) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="font-['Spline_Sans',sans-serif] font-semibold text-slate-700 text-[12px] tracking-[1.2px] uppercase">
                  Team Workload
                </h3>
              </div>
              <div className="divide-y divide-slate-200">
                {members.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No members found"
                    description="Invite members to your workspace to collaborate."
                  />
                ) : (
                  members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.avatar_url ?? undefined} />
                        <AvatarFallback className="text-xs bg-[#f5f3ff] text-primary">
                          {(member.display_name ?? "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {member.display_name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{member.email}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          <Folder className="w-3 h-3 text-slate-500" />
                          <span className="font-medium text-slate-900">{member.taskCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span className="font-medium text-slate-900">{member.completedCount}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
