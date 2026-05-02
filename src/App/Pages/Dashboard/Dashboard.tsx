import { Zap, Play, BrainCircuit, Hourglass, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

interface DashboardStats {
  avg_flow_score: number;
  today_deep_work_seconds: number;
  tasks_completed: number;
  tasks_total: number;
}

interface Task {
  id: string;
  title: string;
  description?: string;
}

export default function Dashboard() {
  const { currentWorkspaceId } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!currentWorkspaceId) return;

    const fetchData = async () => {
      // Fetch stats
      const { data: statsData, error: statsError } = await supabase.rpc(
        "get_dashboard_stats",
        { p_workspace_id: currentWorkspaceId },
      );

      if (statsError) console.error("Error fetching stats:", statsError);
      else setStats(statsData);

      // Fetch only top priority tasks for preview
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .eq("workspace_id", currentWorkspaceId)
        .eq("status", "todo")
        .order("created_at", { ascending: false })
        .limit(3); // Show fewer for dashboard preview

      if (tasksError) console.error("Error fetching tasks:", tasksError);
      else setTasks(tasksData || []);
    };

    fetchData();
  }, [currentWorkspaceId, supabase]);

  return (
    <div className="page-container">
      <div className="flex items-start justify-between w-full pt-6 px-4 md:px-0">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-['Spline_Sans',sans-serif] font-bold text-[#0f172a] text-[32px] md:text-[48px] tracking-[-1.2px] leading-tight m-0">
            Good morning.
          </h1>
          <p className="font-['Spline_Sans',sans-serif] font-normal text-[#64748b] text-[16px] leading-[25.6px] m-0">
            You have 4 primary tasks for today's focus block.
          </p>
        </div>

        <div className="flex gap-4 items-start">
          <button className="bg-white border border-[#e2e8f0] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex gap-2 items-center px-6.25 py-3.25 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
            <Zap className="w-3 h-3.75 text-[#334155]" />
            <span className="font-['Spline_Sans',sans-serif] font-semibold text-[#334155] text-[12px] tracking-[1.2px] uppercase">
              Quick Task
            </span>
          </button>

          <button className="bg-linear-to-r from-[#7c3aed] to-[#4f46e5] drop-shadow-[0px_4px_6px_rgba(139,92,246,0.2)] flex gap-2 items-center px-6 py-3.25 rounded-lg hover:opacity-90 transition-opacity cursor-pointer border-none">
            <Play className="w-[10.5px] h-[10.5px] text-white fill-white" />
            <span className="font-['Spline_Sans',sans-serif] font-semibold text-[12px] text-white tracking-[1.2px] uppercase">
              Start Session
            </span>
          </button>
        </div>
      </div>

      {/* Bento Grid Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {/* Flow Score Card */}
        <div className="bg-white border border-[#f1f5f9] flex flex-col gap-3 items-start overflow-hidden p-6.25 relative rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] w-full">
          <div className="absolute bg-[rgba(139,92,246,0.05)] blur-[32px] right-[-39.66px] rounded-2xl w-40 h-40 -top-10 pointer-events-none" />

          <div className="flex items-start justify-between pb-5 w-full relative z-10">
            <div className="flex flex-col gap-1 items-start">
              <h3 className="font-['Spline_Sans',sans-serif] font-semibold text-[#64748b] text-[12px] tracking-[1.2px] uppercase leading-3 m-0">
                Flow Score
              </h3>
              <div className="flex items-end leading-0 pb-px tracking-[-0.6px]">
                <span className="font-['Spline_Sans',sans-serif] font-semibold text-[#0f172a] text-[30px] leading-9">
                  {stats?.avg_flow_score ?? 0}
                </span>
                <span className="font-['Spline_Sans',sans-serif] font-normal text-[#94a3b8] text-[18px] leading-7">
                  /100
                </span>
              </div>
            </div>
            <div className="w-9 h-9 bg-[#f5f3ff] rounded-full flex items-center justify-center text-[#8b5cf6]">
              <BrainCircuit className="w-4.5 h-4.5" />
            </div>
          </div>

          <div className="bg-[#f1f5f9] h-1.5 relative rounded-2xl w-full overflow-hidden z-10">
            <div
              className="absolute bg-linear-to-r from-[#8b5cf6] to-[#6366f1] h-1.5 left-0 rounded-2xl top-0"
              style={{ width: `${stats?.avg_flow_score ?? 0}%` }}
            />
          </div>

          <div className="flex flex-col items-start w-full relative z-10">
            <p className="font-['Spline_Sans',sans-serif] font-normal text-[#64748b] text-[14px] leading-5.25 m-0">
              +12pts from yesterday
            </p>
          </div>
        </div>

        {/* Deep Work Card */}
        <div className="bg-white border border-[#f1f5f9] flex flex-col gap-4 items-start overflow-hidden pb-8.25 pt-6.25 px-6.25 relative rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] w-full">
          <div className="absolute bg-[rgba(16,185,129,0.05)] blur-[32px] right-[-39.67px] rounded-2xl w-40 h-40 -top-10 pointer-events-none" />

          <div className="flex items-start justify-between w-full relative z-10">
            <div className="flex flex-col gap-1 items-start">
              <h3 className="font-['Spline_Sans',sans-serif] font-semibold text-[#64748b] text-[12px] tracking-[1.2px] uppercase leading-3 m-0">
                Deep Work
              </h3>
              <div className="flex flex-col items-start">
                <span className="font-['Spline_Sans',sans-serif] font-semibold text-[#0f172a] text-[30px] tracking-[-0.6px] leading-9">
                  {stats
                    ? `${Math.floor(stats.today_deep_work_seconds / 3600)}h ${Math.floor((stats.today_deep_work_seconds % 3600) / 60)}m`
                    : "0h 0m"}
                </span>
              </div>
            </div>
            <div className="w-9 h-9 bg-[#ecfdf5] rounded-full flex items-center justify-center text-[#10b981]">
              <Hourglass className="w-4.5 h-4.5" />
            </div>
          </div>

          <div className="h-12 w-full relative z-10">
            <div className="flex gap-2 items-end w-full h-full">
              <div className="bg-[#f1f5f9] flex-1 h-[30%] rounded-t-[2px]" />
              <div className="bg-[#f1f5f9] flex-1 h-[50%] rounded-t-[2px]" />
              <div className="bg-[#f1f5f9] flex-1 h-[80%] rounded-t-[2px]" />
              <div className="bg-[#f1f5f9] flex-1 h-[40%] rounded-t-[2px]" />
              <div className="bg-[#f1f5f9] flex-1 h-[60%] rounded-t-[2px]" />
              <div className="bg-[#10b981] flex-1 h-full rounded-t-[2px] shadow-[0px_2px_10px_0px_rgba(16,185,129,0.2)]" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#f1f5f9] flex flex-col gap-8 items-start overflow-hidden pb-8 pt-6.25 px-6.25 relative rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] w-full">
          <div className="absolute bg-[rgba(59,130,246,0.05)] blur-[32px] right-[-39.65px] rounded-2xl w-40 h-40 -top-10 pointer-events-none" />

          <div className="flex items-start justify-between w-full relative z-10">
            <div className="flex flex-col gap-1 items-start">
              <h3 className="font-['Spline_Sans',sans-serif] font-semibold text-[#64748b] text-[12px] tracking-[1.2px] uppercase leading-3 m-0">
                Tasks Done
              </h3>
              <div className="flex items-end leading-0 pb-px tracking-[-0.6px]">
                <span className="font-['Spline_Sans',sans-serif] font-semibold text-[#0f172a] text-[30px] leading-9">
                  {stats?.tasks_completed ?? 0}
                </span>
                <span className="font-['Spline_Sans',sans-serif] font-normal text-[#94a3b8] text-[18px] leading-7">
                  /{stats?.tasks_total ?? 0}
                </span>
              </div>
            </div>
            <div className="w-9 h-9 bg-[#eff6ff] rounded-full flex items-center justify-center text-[#3b82f6]">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
          </div>

          <div className="w-full relative z-10">
            <div className="flex items-start pr-2">
              <div className="bg-[#f1f5f9] border-2 border-white flex items-center justify-center rounded-full w-8 h-8 z-4">
                <span className="font-['Spline_Sans',sans-serif] font-medium text-[#475569] text-[12px]">
                  A
                </span>
              </div>
              <div className="bg-[#f1f5f9] border-2 border-white flex items-center justify-center rounded-full w-8 h-8 -ml-2 z-3">
                <span className="font-['Spline_Sans',sans-serif] font-medium text-[#475569] text-[12px]">
                  B
                </span>
              </div>
              <div className="bg-[#f1f5f9] border-2 border-white flex items-center justify-center rounded-full w-8 h-8 -ml-2 z-2">
                <span className="font-['Spline_Sans',sans-serif] font-medium text-[#475569] text-[12px]">
                  C
                </span>
              </div>
              <div className="bg-[#f1f5f9] border-2 border-white flex items-center justify-center rounded-full w-8 h-8 -ml-2 z-1">
                <span className="font-['Spline_Sans',sans-serif] font-medium text-[#475569] text-[12px]">
                  +9
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Tasks List Section */}
      <div className="bg-white border border-[#f1f5f9] flex flex-col items-start overflow-hidden relative rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] w-full">
        <div className="bg-[rgba(248,250,252,0.5)] border-b border-[#f1f5f9] flex items-center justify-between px-6 py-5 w-full">
          <h3 className="font-['Spline_Sans',sans-serif] font-semibold text-[#334155] text-[12px] tracking-[1.2px] uppercase m-0">
            Current Focus Block
          </h3>
        </div>

        <div className="flex flex-col w-full">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className={`bg-white ${index !== 0 ? "border-t border-[#f1f5f9]" : ""} flex gap-4 items-center p-6 relative w-full`}
            >
              {index === 0 && (
                <div className="absolute bg-cu-purple bottom-0 left-0 shadow-[2px_0px_8px_0px_rgba(139,92,246,0.2)] top-0 w-1" />
              )}

              <div className="border-2 border-[#cbd5e1] rounded-md w-6 h-6 shrink-0" />

              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <h4 className="font-['Spline_Sans',sans-serif] font-medium text-[#334155] text-[16px] leading-[25.6px] m-0 truncate">
                  {task.title}
                </h4>
                {task.description && (
                  <p className="font-['Spline_Sans',sans-serif] font-normal text-[#64748b] text-[14px] leading-5.25 m-0 truncate">
                    {task.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <Link
          to="/tasks"
          className="bg-[#f8fafc] border-t border-[#f1f5f9] flex items-center justify-center py-4 w-full cursor-pointer hover:bg-[#f1f5f9] transition-colors no-underline"
        >
          <span className="font-['Spline_Sans',sans-serif] font-semibold text-[#64748b] text-[10px] tracking-[1px] uppercase leading-4">
            VIEW ALL TASKS
          </span>
        </Link>
      </div>
    </div>
  );
}
