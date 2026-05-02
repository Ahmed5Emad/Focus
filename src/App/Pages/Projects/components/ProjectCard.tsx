import { MoreHorizontal, CheckSquare, Calendar, Trash2, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Project {
  id: number;
  created_at: string;
  user_id: string;
  title: string;
  description: string;
  status: "active" | "completed" | "on_hold";
  workspace_id: string;
  category: string;
}

interface ProjectCardProps {
  project: Project;
  onUpdate: (id: number, updates: Partial<Project>) => void;
  onDelete: (id: number) => void;
}

export function ProjectCard({ project, onUpdate, onDelete }: ProjectCardProps) {
  const formattedDate = new Intl.DateTimeFormat("en-US", { 
    month: "short", 
    day: "numeric",
    year: "numeric" 
  }).format(new Date(project.created_at));

  const statusColors = {
    active: "bg-[#e0f2fe] text-[#0369a1]",
    completed: "bg-[#f0fdf4] text-[#15803d]",
    on_hold: "bg-[#fefce8] text-[#a16207]",
  };

  return (
    <div className="col-span-1 md:col-span-6 bg-white rounded-xl p-6 shadow-[0px_4px_12px_rgba(139,92,246,0.04)] border border-slate-100 flex flex-col justify-between hover:-translate-y-0.5 transition-transform duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-['Spline_Sans',sans-serif] text-[22px] leading-[1.3] font-semibold text-[#0b1c30] truncate">
              {project.title}
            </h2>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-['Space_Grotesk',sans-serif] text-[10px] font-bold leading-none tracking-[0.05em] uppercase ${statusColors[project.status]}`}>
              {project.status.replace("_", " ")}
            </span>
          </div>
          <p className="font-['Inter',sans-serif] text-[14px] leading-[1.5] text-[#494454] line-clamp-2 mb-3">
            {project.description || "No description provided."}
          </p>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#f5f3ff] text-[#6b38d4] font-['Space_Grotesk',sans-serif] text-[12px] font-bold leading-none tracking-[0.05em]">
            {project.category || "General"}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-[#7b7486] hover:text-[#7b68ee] transition-colors ml-2">
              <MoreHorizontal className="w-6 h-6" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onUpdate(project.id, { status: project.status === "completed" ? "active" : "completed" })}>
              <CheckSquare className="w-4 h-4 mr-2" />
              {project.status === "completed" ? "Mark Active" : "Mark Completed"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdate(project.id, { status: "on_hold" })}>
              <Clock className="w-4 h-4 mr-2" />
              Put on Hold
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(project.id)} className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[#64748b] font-['Inter',sans-serif] text-[13px]">
          <Calendar className="w-4 h-4" />
          <span>Created {formattedDate}</span>
        </div>
        <div className="flex -space-x-2">
          <div className="w-7 h-7 rounded-full bg-[#7b68ee] border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
            {project.title.charAt(0)}
          </div>
        </div>
      </div>
    </div>
  );
}
