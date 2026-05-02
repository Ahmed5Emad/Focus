import { MoreHorizontal, CheckSquare, Calendar, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Goal {
  id: number;
  created_at: string;
  user_id: string;
  title: string;
  is_complete: boolean;
  workspace_id: string;
  progress: number;
  category: string;
  due_date: string | null;
}

interface GoalCardProps {
  goal: Goal;
  onUpdate: (id: number, updates: Partial<Goal>) => void;
  onDelete: (id: number) => void;
}

export function GoalCard({ goal, onUpdate, onDelete }: GoalCardProps) {
  const handleProgressUpdate = () => {
    const newProgress = Math.min(goal.progress + 10, 100);
    onUpdate(goal.id, { progress: newProgress, is_complete: newProgress === 100 });
  };

  const formattedDate = goal.due_date
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(goal.due_date))
    : "No due date";

  return (
    <div className="col-span-1 md:col-span-8 bg-white rounded-xl p-6 shadow-[0px_4px_12px_rgba(139,92,246,0.04)] border border-slate-100 flex flex-col justify-between hover:-translate-y-0.5 transition-transform duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="font-['Spline_Sans',sans-serif] text-[24px] leading-[1.3] font-semibold text-[#0b1c30]">
            {goal.title}
          </h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#57dffe] text-[#006172] font-['Space_Grotesk',sans-serif] text-[12px] font-bold leading-none tracking-[0.05em] mt-2">
            {goal.category || "General"}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-[#7b7486] hover:text-[#6b38d4] transition-colors">
              <MoreHorizontal className="w-6 h-6" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onUpdate(goal.id, { is_complete: !goal.is_complete, progress: !goal.is_complete ? 100 : 0 })}>
              <CheckSquare className="w-4 h-4 mr-2" />
              {goal.is_complete ? "Mark Incomplete" : "Mark Complete"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(goal.id)} className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-auto">
        <div className="flex justify-between font-['Inter',sans-serif] text-[14px] leading-[1.4] text-[#494454] mb-2">
          <span>Progress</span>
          <span className="font-semibold text-[#6b38d4]">{goal.progress}%</span>
        </div>
        <div className="w-full bg-[#e5eeff] h-2 rounded-full overflow-hidden cursor-pointer" onClick={handleProgressUpdate}>
          <div
            className="bg-[#00687a] h-full rounded-full transition-all duration-300"
            style={{ width: `${goal.progress}%` }}
          ></div>
        </div>
        <div className="mt-4 flex gap-2">
          <div className="flex items-center gap-1 text-[#494454] font-['Inter',sans-serif] text-[14px] leading-[1.4] bg-[#eff4ff] px-3 py-1.5 rounded-lg">
            <Calendar className="w-4.5 h-4.5" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
