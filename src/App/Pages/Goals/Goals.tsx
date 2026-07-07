import { useState, useEffect } from "react";
import { Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { GoalCard } from "./components/GoalCard";
import type { Goal } from "./components/GoalCard";
import { CreateGoalModal } from "./components/CreateGoalModal";
import { EmptyGoalsState } from "./components/EmptyGoalsState";
import { Skeleton } from "@/components/ui/skeleton";

export default function Goals() {
  const { user, currentWorkspaceId } = useAuth();
  const [supabase] = useState(() => createClient());
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<{ id: string; title: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"active" | "completed">("active");

  useEffect(() => {
    if (!user || !currentWorkspaceId) {
      setIsLoading(false);
      return;
    }
    fetchGoals();
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentWorkspaceId]);

  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("workspace_id", currentWorkspaceId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("id, title")
        .eq("workspace_id", currentWorkspaceId);
      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleCreateGoal = async (newGoal: { title: string; category: string; due_date: string | null; task_id: string | null }) => {
    if (!user || !currentWorkspaceId) return;

    try {
      const { data, error } = await supabase
        .from("goals")
        .insert([
          {
            title: newGoal.title,
            category: newGoal.category,
            due_date: newGoal.due_date,
            task_id: newGoal.task_id,
            user_id: user.id,
            workspace_id: currentWorkspaceId,
            progress: 0,
            is_complete: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setGoals([data, ...goals]);
        toast.success("Goal created");
      }
    } catch (error) {
      console.error("Error creating goal:", error);
      toast.error("Failed to create goal");
    }
  };

  const handleUpdateGoal = async (id: string, updates: Partial<Goal>) => {
    try {
      const { error } = await supabase
        .from("goals")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      setGoals(goals.map((g) => (g.id === id ? { ...g, ...updates } : g)));
    } catch (error) {
      console.error("Error updating goal:", error);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from("goals")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setGoals(goals.filter((g) => g.id !== id));
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  const filteredGoals = goals.filter((g) => 
    filter === "active" ? !g.is_complete : g.is_complete
  );

  return (
    <div className="page-container pt-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
        <div>
          <h1 className="page-title mb-2">
            My Goals
          </h1>
          <p className="page-description">
            Track your long-term ambitions and milestones.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="filter-tabs">
            <button 
              onClick={() => setFilter("active")}
              className={`filter-tab ${
                filter === "active" 
                  ? "filter-tab-active" 
                  : "filter-tab-inactive"
              }`}
            >
              Active
            </button>
            <button 
              onClick={() => setFilter("completed")}
              className={`filter-tab ${
                filter === "completed" 
                  ? "filter-tab-active" 
                  : "filter-tab-inactive"
              }`}
            >
              Completed
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-[0px_4px_12px_rgba(139,92,246,0.04)] border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-7 w-3/4 mb-3" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-6 w-6 shrink-0 ml-2" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full mb-4" />
                  <Skeleton className="h-6 w-24 rounded-lg" />
                </div>
              </div>
            ))}
            <div className="rounded-xl p-6 shadow-[0px_4px_12px_rgba(139,92,246,0.04)] border border-slate-100 bg-linear-to-br from-[#e9ddff] to-[#dce9ff] flex flex-col justify-center items-center text-center">
              <Skeleton className="h-12 w-12 rounded-full mb-4" />
              <Skeleton className="h-7 w-56 mb-2" />
              <Skeleton className="h-5 w-44 mb-6" />
              <Skeleton className="h-10 w-28 rounded-lg" />
            </div>
          </>
        ) : goals.length === 0 ? (
          <div className="col-span-full">
            <EmptyGoalsState onCreateGoal={handleCreateGoal} tasks={tasks} />
          </div>
        ) : (
          <>
            {filteredGoals.map((goal) => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                onUpdate={handleUpdateGoal} 
                onDelete={handleDeleteGoal} 
              />
            ))}

            <div className="rounded-xl p-6 shadow-[0px_4px_12px_rgba(139,92,246,0.04)] border border-slate-100 bg-linear-to-br from-[#e9ddff] to-[#dce9ff] flex flex-col justify-center items-center text-center hover:-translate-y-0.5 transition-transform duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-[#6b38d4] via-transparent to-transparent"></div>
              <Trophy className="w-12 h-12 text-[#6b38d4] mb-4" />
              <h3 className="font-['Spline_Sans',sans-serif] text-[24px] leading-[1.3] font-semibold text-[#0b1c30] mb-2">
                Ready for a new challenge?
              </h3>
              <p className="font-['Inter',sans-serif] text-[16px] leading-normal text-[#494454] mb-6">
                Define a new objective and start tracking your progress today.
              </p>
              <CreateGoalModal onCreate={handleCreateGoal} tasks={tasks}>
                <button className="btn-primary z-10">
                  Create Goal
                </button>
              </CreateGoalModal>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
