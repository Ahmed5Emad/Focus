import { Layout } from "lucide-react";
import { CreateProjectModal } from "./CreateProjectModal";
import { Button } from "@/components/ui/button";

interface EmptyProjectsStateProps {
  onCreateProject: (newProject: { title: string; description: string; category: string }) => Promise<void>;
}

export function EmptyProjectsState({ onCreateProject }: EmptyProjectsStateProps) {
  return (
    <div className="col-span-1 md:col-span-12 flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-primary rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-24 h-24 bg-linear-to-br from-[#f5f3ff] to-[#ede9fe] rounded-3xl flex items-center justify-center mb-8 shadow-sm rotate-3 group-hover:rotate-0 transition-transform duration-500">
          <Layout className="w-12 h-12 text-primary" />
        </div>
        
        <h2 className="font-['Spline_Sans',sans-serif] text-[32px] md:text-[40px] leading-tight font-bold text-[#0b1c30] mb-4 tracking-tight">
          Build something amazing
        </h2>
        
        <p className="font-['Inter',sans-serif] text-[18px] leading-relaxed text-[#494454] max-w-lg mb-10">
          You haven't created any projects yet. Start a new initiative to organize your tasks and achieve your goals.
        </p>
        
        <CreateProjectModal onCreate={onCreateProject}>
          <Button className="btn-primary w-fit">
            Create Your First Project
          </Button>
        </CreateProjectModal>
      </div>
    </div>
  );
}
