import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Zap,
  Play,
  BrainCircuit,
  Hourglass,
  CheckCircle2,
  Check,
  ArrowRight,
  Target,
  ListTodo,
  Flame,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFocus } from "@/contexts/FocusContext";
import { supabase } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useActivityFeed } from "@/hooks/useActivityFeed";
import ActivityFeed from "./components/ActivityFeed";

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return "0h 0m";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

interface DashboardStats {
  avg_flow_score: number;
  today_deep_work_seconds: number;
  tasks_completed: number;
  tasks_total: number;
  flow_score_change: number;
}

interface PriorityTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
}

interface GoalItem {
  id: string;
  title: string;
  is_complete: boolean;
  progress: number;
  category: string;
  due_date: string | null;
}

interface WeeklySession {
  actual_duration_seconds: number;
  start_time: string;
}

const priorityMeta: Record<string, { dot: string; label: string }> = {
  urgent: { dot: "bg-red-500", label: "Urgent" },
  high: { dot: "bg-orange-400", label: "High" },
  medium: { dot: "bg-blue-500", label: "Medium" },
  low: { dot: "bg-slate-400", label: "Low" },
  none: { dot: "bg-slate-300", label: "" },
};

function getDueLabel(dateStr: string | null): {
  label: string;
  urgent: boolean;
} {
  if (!dateStr) return { label: "", urgent: false };
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(dateStr);
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diffDays = Math.round((dueDay.getTime() - today.getTime()) / 86400000);

  if (diffDays < 0)
    return { label: `${Math.abs(diffDays)}d overdue`, urgent: true };
  if (diffDays === 0) return { label: "Today", urgent: true };
  if (diffDays === 1) return { label: "Tomorrow", urgent: false };
  if (diffDays <= 7) return { label: `In ${diffDays}d`, urgent: false };
  return {
    label: due.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    urgent: false,
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, currentWorkspaceId } = useAuth();
  const { activeSession, startSession } = useFocus();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [priorityTasks, setPriorityTasks] = useState<PriorityTask[]>([]);
  const [activeGoals, setActiveGoals] = useState<GoalItem[]>([]);
  const [weeklySessions, setWeeklySessions] = useState<WeeklySession[]>([]);
  const [previousWeeklySessions, setPreviousWeeklySessions] = useState<WeeklySession[]>([]);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentWorkspaceId || !user) return;

    const fetchData = async () => {
      setIsLoading(true);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [
        statsResult,
        tasksResult,
        goalsResult,
        weeklyResult,
        previousWeeklyResult,
        totalTasksCountResult,
        completedTasksCountResult,
        streakDatesResult,
      ] = await Promise.all([
        supabase.rpc("get_dashboard_stats", {
          p_workspace_id: currentWorkspaceId,
        }),
        supabase
          .from("tasks")
          .select("id, title, status, priority, due_date")
          .eq("workspace_id", currentWorkspaceId)
          .is("is_archived", false)
          .in("status", ["todo", "in_progress"])
          .order("due_date", { ascending: true, nullsFirst: false })
          .limit(7),
        supabase
          .from("goals")
          .select("*")
          .eq("workspace_id", currentWorkspaceId)
          .eq("user_id", user.id)
          .eq("is_complete", false)
          .order("progress", { ascending: true })
          .limit(4),
        supabase
          .from("focus_sessions")
          .select("actual_duration_seconds, start_time")
          .eq("workspace_id", currentWorkspaceId)
          .eq("user_id", user.id)
          .gte("start_time", sevenDaysAgo.toISOString())
          .in("status", ["completed", "abandoned"]),
        supabase
          .from("focus_sessions")
          .select("actual_duration_seconds, start_time")
          .eq("workspace_id", currentWorkspaceId)
          .eq("user_id", user.id)
          .gte("start_time", fourteenDaysAgo.toISOString())
          .lt("start_time", sevenDaysAgo.toISOString())
          .in("status", ["completed", "abandoned"]),
        supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("workspace_id", currentWorkspaceId)
          .is("is_archived", false),
        supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("workspace_id", currentWorkspaceId)
          .eq("status", "done")
          .is("is_archived", false)
          .gte("created_at", todayStart.toISOString()),
        supabase
          .from("focus_sessions")
          .select("start_time")
          .eq("workspace_id", currentWorkspaceId)
          .eq("user_id", user.id)
          .in("status", ["completed"])
          .order("start_time", { ascending: false })
      ]);

      if (!statsResult.error) {
        setStats({
          ...statsResult.data,
          tasks_total: totalTasksCountResult.count ?? statsResult.data.tasks_total,
          tasks_completed: completedTasksCountResult.count ?? statsResult.data.tasks_completed,
        });
      }
      if (!tasksResult.error) setPriorityTasks(tasksResult.data || []);
      if (!goalsResult.error) setActiveGoals(goalsResult.data || []);
      if (!weeklyResult.error) setWeeklySessions(weeklyResult.data || []);
      if (!previousWeeklyResult.error) setPreviousWeeklySessions(previousWeeklyResult.data || []);

      if (!streakDatesResult.error && streakDatesResult.data) {
        const dates = new Set<string>();
        for (const s of streakDatesResult.data) {
          const day = s.start_time.split("T")[0];
          dates.add(day);
        }
        const sorted = [...dates].sort().reverse();
        let count = 0;
        const today = new Date();
        for (let i = 0; i < sorted.length; i++) {
          const expected = new Date(today);
          expected.setDate(expected.getDate() - i);
          const expectedKey = expected.toISOString().split("T")[0];
          if (sorted[i] === expectedKey) {
            count++;
          } else {
            break;
          }
        }
        setStreak(count);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [currentWorkspaceId, user]);

  const weeklyChart = useMemo(() => {
    const days: { label: string; seconds: number }[] = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const total = weeklySessions
        .filter((s) => s.start_time.startsWith(key))
        .reduce((sum, s) => sum + (s.actual_duration_seconds || 0), 0);
      days.push({ label: dayNames[d.getDay()], seconds: total });
    }
    return days;
  }, [weeklySessions]);

  const weeklyTrend = useMemo(() => {
    const thisWeekTotal = weeklySessions.reduce((sum, s) => sum + (s.actual_duration_seconds || 0), 0);
    const lastWeekTotal = previousWeeklySessions.reduce((sum, s) => sum + (s.actual_duration_seconds || 0), 0);
    if (lastWeekTotal < 60) return thisWeekTotal > 0 ? 100 : 0;
    return Math.min(Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100), 999);
  }, [weeklySessions, previousWeeklySessions]);

  const maxWeeklySeconds = Math.max(...weeklyChart.map((d) => d.seconds), 1);
  const greeting = getGreeting();

  const completeTask = async (taskId: string) => {
    const { error } = await supabase
      .from("tasks")
      .update({ status: "done", completed_at: new Date().toISOString() })
      .eq("id", taskId);
    if (!error) {
      setPriorityTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
  };
  const sessionActive = activeSession?.status === "active";

  return (
    <div className="page-container">
      {/* ── Hero ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6 mb-3">
        <div>
          <h1 className="page-title mb-1">
            {greeting}
            {typeof user?.user_metadata?.display_name === "string"
              ? `, ${user.user_metadata.display_name.split(" ")[0]}`
              : ""}
            .
          </h1>
          <p className="page-description">
            {isLoading
              ? "Loading…"
              : stats && stats.today_deep_work_seconds > 0
                ? `Focused ${formatDuration(stats.today_deep_work_seconds)} today${
                    stats.tasks_completed > 0
                      ? ` · ${stats.tasks_completed} done`
                      : ""
                  }`
                : priorityTasks.length > 0
                  ? `${priorityTasks.length} task${priorityTasks.length !== 1 ? "s" : ""} waiting`
                  : "All clear. Create a task or set a goal."}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate("/tasks/new")}
            className="bg-white border border-slate-200 shadow-sm flex gap-2 items-center px-5 py-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Create quick task"
          >
            <Zap className="w-3 h-3.5 text-slate-600" />
            <span className="font-semibold text-slate-700 text-xs tracking-[1px] uppercase">
              Quick Task
            </span>
          </button>
          <button
            onClick={() =>
              currentWorkspaceId && startSession(null, currentWorkspaceId)
            }
            className="bg-linear-to-r from-[#8b5cf6] to-[#6366f1] hover:from-[#7c3aed] hover:to-[#4f46e5] text-white flex gap-2 items-center px-5 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={sessionActive ? "Focus session active" : "Start focus session"}
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span className="font-semibold text-xs tracking-[1px] uppercase">
              {sessionActive ? "Focusing…" : "Start Session"}
            </span>
          </button>
        </div>
      </div>

      {/* ── Metrics ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
        {/* Flow Score */}
        <div className="bg-white rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-0 p-5 flex flex-col">
          {isLoading ? (
            <div className="flex flex-col gap-3 w-full">
              <div className="flex items-start justify-between w-full">
                <div className="flex flex-col gap-4">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-9 w-24" />
                </div>
                <Skeleton className="h-9 w-9 rounded-full" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-2xl" />
              <Skeleton className="h-4 w-36" />
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between shrink-0">
                <p className="font-semibold text-slate-500 text-xs tracking-[1.2px] uppercase">Flow Score</p>
                <div className="w-10 h-10 bg-[#f5f3ff] rounded-full flex items-center justify-center text-[#8b5cf6] shrink-0">
                  <BrainCircuit className="w-5 h-5" />
                </div>
              </div>
              <div className="flex-1 flex items-center py-2">
                <span className="font-bold text-slate-900 text-6xl leading-none tracking-[-1.5px] drop-shadow-[0_4px_8px_rgba(123,104,238,0.35)]">
                  {Math.round(stats?.avg_flow_score ?? 0)}
                </span>
                <span className="font-normal text-slate-400 text-lg leading-none ml-1 mt-3">/100</span>
              </div>
              <div className="shrink-0 space-y-2">
                <div className="bg-slate-100 h-1.5 rounded-2xl overflow-hidden">
                  <div className="bg-linear-to-r from-[#8b5cf6] to-[#6366f1] h-1.5 rounded-2xl" style={{ width: `${stats?.avg_flow_score ?? 0}%` }} />
                </div>
                <p className="text-slate-500 text-sm">
                  {stats?.flow_score_change != null && stats.flow_score_change >= 0 ? "+" : ""}
                  {Math.round(stats?.flow_score_change ?? 0)}pts vs yesterday
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Deep Work */}
        <div className="bg-white rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-0 p-5 flex flex-col">
          {isLoading ? (
            <div className="flex flex-col gap-3 w-full">
              <div className="flex items-start justify-between w-full">
                <div className="flex flex-col gap-4">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-9 w-28" />
                </div>
                <Skeleton className="h-9 w-9 rounded-full" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between shrink-0">
                <p className="font-semibold text-slate-500 text-xs tracking-[1.2px] uppercase">Deep Work</p>
                <div className="w-10 h-10 bg-[#ecfdf5] rounded-full flex items-center justify-center text-[#10b981] shrink-0">
                  <Hourglass className="w-5 h-5" />
                </div>
              </div>
              <div className="flex-1 flex items-center py-2">
                <span className="font-bold text-slate-900 text-3xl leading-none tracking-[-0.5px] drop-shadow-[0_4px_8px_rgba(16,185,129,0.35)]">
                  {formatDuration(stats?.today_deep_work_seconds)}
                </span>
              </div>
              <div className="shrink-0 space-y-1.5">
                <div className="flex gap-1.5 items-end h-12">
                  {weeklyChart.map((day, i) => {
                    const pct = (day.seconds / maxWeeklySeconds) * 100;
                    const isToday = i === weeklyChart.length - 1;
                    return (
                      <div key={day.label} className="flex-1 flex flex-col items-center gap-0.5">
                        <div className={`w-full rounded-t-[2px] transition-all duration-500 ${isToday ? "bg-[#10b981] shadow-[0px_2px_10px_0px_rgba(16,185,129,0.2)]" : "bg-slate-100"}`} style={{ height: `${Math.max(pct, 8)}%` }} />
                        <span className={`text-[9px] font-medium ${isToday ? "text-[#10b981]" : "text-slate-400"}`}>{day.label[0]}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <TrendingUp className={`w-4 h-4 ${weeklyTrend >= 0 ? "text-emerald-500" : "text-red-500 rotate-180"}`} />
                  <span className={`font-semibold ${weeklyTrend >= 0 ? "text-emerald-600" : "text-red-600"}`}>{weeklyTrend >= 0 ? "+" : ""}{weeklyTrend}%</span>
                  <span className="text-slate-400">vs last week</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tasks Done */}
        <div className="bg-white rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-0 p-5 flex flex-col">
          {isLoading ? (
            <div className="flex flex-col gap-3 w-full">
              <div className="flex items-start justify-between w-full">
                <div className="flex flex-col gap-6">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-9 w-20" />
                </div>
                <Skeleton className="h-9 w-9 rounded-full" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between shrink-0">
                <p className="font-semibold text-slate-500 text-xs tracking-[1.2px] uppercase">Tasks Done</p>
                <div className="w-10 h-10 bg-[#eff6ff] rounded-full flex items-center justify-center text-[#3b82f6] shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="flex-1 flex items-center py-2">
                <span className="font-bold text-slate-900 text-6xl leading-none tracking-[-1.5px] drop-shadow-[0_4px_8px_rgba(59,130,246,0.35)]">
                  {stats?.tasks_completed ?? 0}
                </span>
                <span className="font-normal text-slate-400 text-lg leading-none ml-1 mt-3">/{stats?.tasks_total ?? 0}</span>
              </div>
              <div className="shrink-0">
                <Link to="/tasks" className="group flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors">
                  {stats?.tasks_total ? `${Math.round(((stats.tasks_completed ?? 0) / stats.tasks_total) * 100)}% complete` : "No tasks yet"}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Focus Streak */}
        <div className="bg-white rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-0 p-5 flex flex-col">
          {isLoading ? (
            <div className="flex flex-col gap-3 w-full">
              <div className="flex items-start justify-between w-full">
                <div className="flex flex-col gap-4">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-9 w-16" />
                </div>
                <Skeleton className="h-9 w-9 rounded-full" />
              </div>
              <Skeleton className="h-4 w-32" />
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between shrink-0">
                <p className="font-semibold text-slate-500 text-xs tracking-[1.2px] uppercase">Focus Streak</p>
                <div className="w-10 h-10 bg-[#fff7ed] rounded-full flex items-center justify-center text-[#f97316] shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
              </div>
              <div className="flex-1 flex items-center py-2">
                <span className="font-bold text-slate-900 text-6xl leading-none tracking-[-1.5px] drop-shadow-[0_4px_8px_rgba(249,115,22,0.35)]">
                  {streak}
                </span>
                <span className="font-normal text-slate-400 text-lg leading-none ml-1 mt-3">{streak === 1 ? "day" : "days"}</span>
              </div>
              <div className="shrink-0">
                <p className="text-slate-500 text-sm">
                  {streak === 0 ? "Start a session to begin your streak" : streak >= 7 ? "Consistent all week!" : "Keep it going daily"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Priority Pipeline ── */}
      <div className="bg-white rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-0 mb-3">
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-slate-500" />
            <h3 className="font-semibold text-slate-700 text-xs tracking-[1px] uppercase">
              Priority Pipeline
            </h3>
          </div>
          <Link
            to="/tasks"
            className="text-xs font-semibold text-[#7c3aed] hover:underline underline-offset-2"
          >
            View All Tasks
          </Link>
        </div>

        {isLoading ? (
          <div className="px-6 pb-5 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-2.5 w-2.5 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-3/4 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : priorityTasks.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-500">
              No pending tasks
            </p>
            <button
              onClick={() => navigate("/tasks/new")}
              className="mt-1 text-xs font-semibold text-[#7c3aed] hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Create a task
            </button>
          </div>
        ) : (
          <div className="pb-2">
            {priorityTasks.map((task, i) => {
              const due = getDueLabel(task.due_date);
              const meta = priorityMeta[task.priority] ?? priorityMeta.none;
              return (
                <div
                  key={task.id}
                  className={`flex items-center gap-4 p-6 ${i > 0 ? "border-t border-slate-100" : ""} group`}
                >
                  <button
                    onClick={(e) => { e.preventDefault(); completeTask(task.id); }}
                    className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0 hover:border-emerald-500 hover:bg-emerald-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    title="Mark as done"
                    aria-label={`Mark task "${task.title}" as done`}
                  >
                    <Check className="w-3.5 h-3.5 text-transparent group-hover:text-emerald-500 transition-colors" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-[16px] truncate">
                      {task.title}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {meta.label && (
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                        {meta.label}
                      </span>
                    )}
                    {due.label && (
                      <span
                        className={`text-[12px] font-semibold px-2 py-0.5 rounded-md ${
                          due.urgent
                            ? "bg-red-50 text-red-600"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {due.label}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Active Goals ── */}
      <div className="bg-white rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-0 mb-3">
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-slate-500" />
            <h3 className="font-semibold text-slate-700 text-xs tracking-[1px] uppercase">
              Active Goals
            </h3>
          </div>
          <Link
            to="/goals"
            className="text-xs font-semibold text-[#7c3aed] hover:underline underline-offset-2"
          >
            View All Goals
          </Link>
        </div>

        {isLoading ? (
          <div className="px-6 pb-5 space-y-5">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-12" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : activeGoals.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <Target className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-500">
              No active goals
            </p>
            <Link
              to="/goals"
              className="mt-1 text-xs font-semibold text-[#7c3aed] hover:underline underline-offset-2"
            >
              Set a goal
            </Link>
          </div>
        ) : (
          <div className="pb-2">
            {activeGoals.map((goal, i) => (
              <Link
                key={goal.id}
                to="/goals"
                className={`flex items-center gap-5 p-6 hover:bg-slate-50 transition-colors no-underline ${i > 0 ? "border-t border-slate-100" : ""}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <p className="font-medium text-slate-800 text-[16px] truncate">
                      {goal.title}
                    </p>
                    {goal.category && (
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded shrink-0">
                        {goal.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-linear-to-r from-[#8b5cf6] to-[#6366f1] h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <span className="font-semibold text-slate-500 text-xs tabular-nums">
                      {goal.progress}%
                    </span>
                  </div>
                </div>
                {goal.due_date && (
                  <span className="text-[12px] font-medium text-slate-400 shrink-0">
                    {new Date(goal.due_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Recent Activity ── */}
      <RecentActivitySection />
    </div>
  );
}

function RecentActivitySection() {
  const { activities, isLoading } = useActivityFeed();

  return (
    <div className="bg-white rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-0 mb-3">
      <div className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-slate-500" />
          <h3 className="font-semibold text-slate-700 text-xs tracking-[1px] uppercase">
            Recent Activity
          </h3>
        </div>
      </div>
      <ActivityFeed activities={activities} isLoading={isLoading} />
    </div>
  );
}
