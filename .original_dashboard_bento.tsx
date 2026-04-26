import { useEffect, useState } from "react";
import { Target, Plus, Command, CheckCircle, Circle, Trash2, Edit2, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Task {
  id: string;
  title: string;
  is_completed: boolean;
  created_at: string;
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchTasks = async () => {
      try {
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTasks(data || []);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [user, supabase]);

  const toggleTaskCompletion = async (taskId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ is_completed: !currentStatus })
        .eq("id", taskId);

      if (error) throw error;

      setTasks(tasks.map(t => t.id === taskId ? { ...t, is_completed: !currentStatus } : t));
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;

      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
  };

  const saveEdit = async (taskId: string) => {
    if (!editTitle.trim()) return;
    
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ title: editTitle.trim() })
        .eq("id", taskId);

      if (error) throw error;

      setTasks(tasks.map(t => t.id === taskId ? { ...t, title: editTitle.trim() } : t));
      setEditingTaskId(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditTitle("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[80vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6b38d4]"></div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full min-h-[80vh] px-6 py-12 md:px-8 md:pb-20">
        <div className="flex flex-col items-center max-w-md text-center w-full">
          <div className="w-24 h-24 mb-8 rounded-[1.5rem] bg-[#ffffff] border border-[#cbc3d7]/30 shadow-[0px_12px_32px_rgba(0,0,0,0.08)] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-[#6b38d4]/10 to-transparent"></div>
            <div className="w-16 h-16 rounded-xl bg-[#eff4ff] flex items-center justify-center relative z-10 border border-[#d3e4fe]/50">
              <Target className="w-8 h-8 text-[#6b38d4]" strokeWidth={1.5} />
            </div>
          </div>

          <h1 className="font-['Spline_Sans',sans-serif] font-bold text-[#0b1c30] dark:text-white text-[32px] md:text-[40px] tracking-[-0.02em] leading-tight mb-4">
            No tasks yet
          </h1>
          <p className="font-['Inter',sans-serif] font-normal text-[#494454] dark:text-zinc-400 text-[16px] md:text-[18px] leading-[1.6] mb-10 max-w-[320px] md:max-w-sm mx-auto">
            Your dashboard is a blank canvas. Create your first task or set a new goal to get started.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto justify-center">
            <button 
              onClick={() => navigate('/tasks/new')}
              className="w-full sm:w-auto bg-[#6b38d4] text-white flex gap-2 items-center justify-center px-6 py-3.5 rounded-xl hover:bg-[#5516be] transition-all shadow-[0px_4px_12px_rgba(107,56,212,0.25)] hover:shadow-[0px_6px_16px_rgba(107,56,212,0.35)] hover:-translate-y-0.5 cursor-pointer border-none"
            >
              <Plus className="w-5 h-5" />
              <span className="font-['Space_Grotesk',sans-serif] font-semibold text-[15px] tracking-[0.02em]">
                Create first task
              </span>
            </button>
            
            <button 
              onClick={() => navigate('/tasks/new')}
              className="w-full sm:w-auto bg-[#ffffff] dark:bg-zinc-900 border border-[#cbc3d7]/50 dark:border-zinc-800 text-[#0b1c30] dark:text-white flex gap-2 items-center justify-center px-6 py-3.5 rounded-xl hover:bg-[#eff4ff] dark:hover:bg-zinc-800 transition-all shadow-[0px_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0px_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 cursor-pointer"
            >
              <Command className="w-5 h-5 text-[#7b7486] dark:text-zinc-400" />
              <span className="font-['Space_Grotesk',sans-serif] font-semibold text-[15px] tracking-[0.02em]">
                Command Palette
              </span>
              <div className="flex gap-1 ml-1.5 opacity-80">
                <kbd className="font-['Space_Grotesk',sans-serif] text-[11px] font-bold text-[#494454] dark:text-zinc-300 bg-[#e5eeff] dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-[#cbc3d7]/40 dark:border-zinc-700">⌘</kbd>
                <kbd className="font-['Space_Grotesk',sans-serif] text-[11px] font-bold text-[#494454] dark:text-zinc-300 bg-[#e5eeff] dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-[#cbc3d7]/40 dark:border-zinc-700">K</kbd>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full h-full min-h-[80vh] px-6 py-12 md:px-8">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-['Spline_Sans',sans-serif] font-bold text-[#0b1c30] dark:text-white text-[32px] tracking-[-0.02em]">
            Your Tasks
          </h1>
          <button 
            onClick={() => navigate('/tasks/new')}
            className="bg-[#6b38d4] text-white flex gap-2 items-center justify-center px-4 py-2.5 rounded-xl hover:bg-[#5516be] transition-all shadow-[0px_4px_12px_rgba(107,56,212,0.25)] hover:shadow-[0px_6px_16px_rgba(107,56,212,0.35)] hover:-translate-y-0.5 cursor-pointer border-none"
          >
            <Plus className="w-4 h-4" />
            <span className="font-['Space_Grotesk',sans-serif] font-semibold text-[14px]">
              New Task
            </span>
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                task.is_completed 
                  ? "bg-zinc-50 border-zinc-200 dark:bg-zinc-900/50 dark:border-zinc-800 opacity-70" 
                  : "bg-white border-[#cbc3d7]/50 dark:bg-zinc-950 dark:border-zinc-800 shadow-[0px_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0px_4px_12px_rgba(0,0,0,0.08)]"
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <button 
                  onClick={() => toggleTaskCompletion(task.id, task.is_completed)}
                  className="text-[#6b38d4] hover:text-[#5516be] transition-colors focus:outline-none"
                >
                  {task.is_completed ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </button>
                
                {editingTaskId === task.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(task.id);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      className="flex-1 bg-transparent border-b border-[#6b38d4] outline-none font-['Inter',sans-serif] text-[16px] text-[#0b1c30] dark:text-white px-1 py-1 focus:ring-0"
                      autoFocus
                    />
                    <button onClick={() => saveEdit(task.id)} className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={cancelEdit} className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <span className={`font-['Inter',sans-serif] text-[16px] ${
                    task.is_completed 
                      ? "text-zinc-500 line-through" 
                      : "text-[#0b1c30] dark:text-white"
                  }`}>
                    {task.title}
                  </span>
                )}
              </div>

              {editingTaskId !== task.id && (
                <div className="flex items-center gap-2 ml-4">
                  <button 
                    onClick={() => startEditing(task)}
                    className="p-2 text-zinc-400 hover:text-[#6b38d4] hover:bg-[#eff4ff] dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
