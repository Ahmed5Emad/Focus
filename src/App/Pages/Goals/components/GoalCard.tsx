import { MoreHorizontal, CheckSquare, Calendar, Trash2, Pencil, Trophy } from "lucide-react";
import { useState, useRef } from "react";
import { EditGoalModal } from "./EditGoalModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Goal {
  id: string;
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
  onUpdate: (id: string, updates: Partial<Goal>) => void;
  onDelete: (id: string) => void;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  health: { bg: "bg-cu-green/15", text: "text-cu-green" },
  learning: { bg: "bg-cu-blue/15", text: "text-cu-blue" },
  career: { bg: "bg-cu-purple/15", text: "text-cu-purple" },
  finance: { bg: "bg-[#fadb14]/15", text: "text-[#a16207]" },
  relationship: { bg: "bg-cu-pink/15", text: "text-cu-pink" },
  productivity: { bg: "bg-cu-orange/15", text: "text-cu-orange" },
};

export function GoalCard({ goal, onUpdate, onDelete }: GoalCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const catColor = categoryColors[goal.category?.toLowerCase()] ?? { bg: "bg-cu-purple/10", text: "text-cu-purple" };

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.round((x / rect.width) * 100 / 5) * 5;
    const clamped = Math.max(0, Math.min(100, pct));
    onUpdate(goal.id, { progress: clamped, is_complete: clamped === 100 });
  };

  const formattedDate = goal.due_date
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(goal.due_date))
    : "No due date";

  return (
    <>
      <EditGoalModal
        goal={goal}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdate={onUpdate}
      />
      <div className="bg-white rounded-xl p-6 shadow-[0px_4px_12px_rgba(139,92,246,0.04)] border border-slate-100 flex flex-col justify-between hover:-translate-y-0.5 transition-transform duration-300">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="font-['Spline_Sans',sans-serif] text-[24px] leading-[1.3] font-semibold text-slate-900">
              {goal.title}
            </h2>
            <span className={`inline-flex items-center px-3 py-1 rounded-full ${catColor.bg} ${catColor.text} font-['Space_Grotesk',sans-serif] text-[12px] font-bold leading-none tracking-[0.05em] mt-2`}>
              {goal.category || "General"}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-[#7b7486] hover:text-cu-purple transition-colors">
                <MoreHorizontal className="w-6 h-6" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
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

        <div className="mt-auto space-y-4">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
              {goal.is_complete ? (
                <Trophy className="w-4 h-4 text-cu-purple" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-cu-purple/60" />
              )}
              {goal.is_complete ? "Completed" : "Progress"}
            </span>
            <span className="text-sm font-bold text-cu-purple tabular-nums">{goal.progress}%</span>
          </div>

          <div
            ref={barRef}
            onClick={handleBarClick}
            className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden cursor-pointer group"
          >
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-cu-purple to-[#6d28d9] rounded-full transition-all duration-500"
              style={{ width: `${goal.progress}%` }}
            />
            {goal.is_complete && (
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckSquare className="w-3.5 h-3.5 text-white drop-shadow" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600 bg-cu-purple/5 px-3 py-1.5 rounded-lg w-fit">
            <Calendar className="w-4 h-4 text-cu-purple/70" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </>
  );
}
