import { Target } from "lucide-react";
import { CreateGoalModal } from "./CreateGoalModal";

interface EmptyGoalsStateProps {
  onCreateGoal: (newGoal: { title: string; category: string; due_date: string | null; task_id: string | null }) => Promise<void>;
  tasks: { id: string; title: string }[];
}

export function EmptyGoalsState({ onCreateGoal, tasks }: EmptyGoalsStateProps) {
  return (
    <div className="col-span-1 md:col-span-12 flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-[#6b38d4] rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-[#d3e4fe] rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-24 h-24 bg-linear-to-br from-[#f5f3ff] to-[#eff6ff] rounded-3xl flex items-center justify-center mb-8 shadow-sm rotate-3 group-hover:rotate-0 transition-transform duration-500">
          <Target className="w-12 h-12 text-[#6b38d4]" />
        </div>
        
        <h2 className="font-['Spline_Sans',sans-serif] text-[32px] md:text-[40px] leading-tight font-bold text-[#0b1c30] mb-4 tracking-tight">
          Your journey starts here
        </h2>
        
        <p className="font-['Inter',sans-serif] text-[18px] leading-relaxed text-[#494454] max-w-lg mb-10">
          You haven't set any goals yet. Define your first objective and start tracking your progress towards success.
        </p>
        
        <CreateGoalModal onCreate={onCreateGoal} tasks={tasks}>
          <button className="bg-[#6b38d4] text-[#ffffff] font-['Space_Grotesk',sans-serif] text-[16px] font-semibold py-4 px-10 rounded-xl hover:bg-[#8455ef] transition-all shadow-[0px_8px_20px_rgba(107,56,212,0.2)] hover:shadow-[0px_12px_24px_rgba(107,56,212,0.3)] hover:-translate-y-1 active:translate-y-0">
            Create Your First Goal
          </button>
        </CreateGoalModal>
      </div>
    </div>
  );
}
