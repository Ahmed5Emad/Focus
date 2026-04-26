import { Zap, Play, BrainCircuit, Hourglass, CheckCircle2, MoreHorizontal, Check, Clock, Pause, Square, Timer } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-4 items-center w-full px-8 pb-20">
      <div className="flex items-start justify-between w-full pt-4 md:pt-6 px-4 md:px-0">
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
                  84
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
            <div className="absolute bg-linear-to-r from-[#8b5cf6] to-[#6366f1] h-1.5 left-0 w-[84%] rounded-2xl top-0" />
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
                  3h 45m
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
                  12
                </span>
                <span className="font-['Spline_Sans',sans-serif] font-normal text-[#94a3b8] text-[18px] leading-7">
                  /16
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
                <span className="font-['Spline_Sans',sans-serif] font-medium text-[#475569] text-[12px]">A</span>
              </div>
              <div className="bg-[#f1f5f9] border-2 border-white flex items-center justify-center rounded-full w-8 h-8 -ml-2 z-3">
                <span className="font-['Spline_Sans',sans-serif] font-medium text-[#475569] text-[12px]">B</span>
              </div>
              <div className="bg-[#f1f5f9] border-2 border-white flex items-center justify-center rounded-full w-8 h-8 -ml-2 z-2">
                <span className="font-['Spline_Sans',sans-serif] font-medium text-[#475569] text-[12px]">C</span>
              </div>
              <div className="bg-[#f1f5f9] border-2 border-white flex items-center justify-center rounded-full w-8 h-8 -ml-2 z-1">
                <span className="font-['Spline_Sans',sans-serif] font-medium text-[#475569] text-[12px]">+9</span>
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
          <button className="text-[#94a3b8] hover:text-[#64748b] transition-colors cursor-pointer bg-transparent border-none p-0 flex items-center justify-center">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col w-full">
          {/* Task 1 - Active */}
          <div className="bg-white flex gap-4 items-center p-6 relative w-full">
            <div className="absolute bg-cu-purple bottom-0 left-0 shadow-[2px_0px_8px_0px_rgba(139,92,246,0.2)] top-0 w-1" />
            
            <div className="bg-[#f5f3ff] border-2 border-cu-purple flex items-center justify-center rounded-md w-6 h-6 shrink-0">
              <Check className="w-3 h-3 text-cu-purple" strokeWidth={3} />
            </div>
            
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <div className="flex gap-3 items-center w-full">
                <h4 className="font-['Spline_Sans',sans-serif] font-semibold text-[#0f172a] text-[16px] leading-[25.6px] m-0 truncate">
                  Design System Documentation
                </h4>
                <div className="bg-[#ede9fe] px-2 py-0.5 rounded-sm shrink-0">
                  <span className="font-['Spline_Sans',sans-serif] font-normal text-[#6d28d9] text-[10px] leading-4 block">
                    IN PROGRESS
                  </span>
                </div>
              </div>
              <p className="font-['Spline_Sans',sans-serif] font-normal text-[#64748b] text-[14px] leading-5.25 m-0 truncate">
                Draft the conflict resolution protocol for styling.
              </p>
            </div>
            
            <div className="flex gap-6 items-center shrink-0">
              <div className="flex gap-1 items-center">
                <Clock className="w-3.5 h-3.5 text-[#94a3b8]" />
                <span className="font-['Spline_Sans',sans-serif] font-medium text-[#64748b] text-[14px] leading-3.5">
                  45m
                </span>
              </div>
              <div className="bg-[#f1f5f9] h-1 overflow-hidden relative rounded-2xl w-20 hidden sm:block">
                <div className="absolute bg-cu-purple h-1 left-0 w-[40%] rounded-2xl top-0" />
              </div>
            </div>
          </div>

          {/* Task 2 - Inactive */}
          <div className="bg-white border-t border-[#f1f5f9] flex gap-4 items-center px-6 py-6 w-full">
            <div className="border-2 border-[#cbd5e1] rounded-md w-6 h-6 shrink-0" />
            
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <h4 className="font-['Spline_Sans',sans-serif] font-medium text-[#334155] text-[16px] leading-[25.6px] m-0 truncate">
                API Endpoint Review
              </h4>
              <p className="font-['Spline_Sans',sans-serif] font-normal text-[#64748b] text-[14px] leading-5.25 m-0 truncate">
                Check authentication flow on /v2/users
              </p>
            </div>
            
            <div className="flex gap-1 items-center shrink-0">
              <Clock className="w-3.5 h-3.5 text-[#94a3b8]" />
              <span className="font-['Spline_Sans',sans-serif] font-medium text-[#64748b] text-[14px] leading-3.5">
                30m
              </span>
            </div>
          </div>

          {/* Task 3 - Inactive */}
          <div className="bg-white border-t border-[#f1f5f9] flex gap-4 items-center px-6 py-6 w-full">
            <div className="border-2 border-[#cbd5e1] rounded-md w-6 h-6 shrink-0" />
            
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <h4 className="font-['Spline_Sans',sans-serif] font-medium text-[#334155] text-[16px] leading-[25.6px] m-0 truncate">
                Quarterly Planning Prep
              </h4>
              <p className="font-['Spline_Sans',sans-serif] font-normal text-[#64748b] text-[14px] leading-5.25 m-0 truncate">
                Review OKRs from Q2 before meeting.
              </p>
            </div>
            
            <div className="flex gap-1 items-center shrink-0">
              <Clock className="w-3.5 h-3.5 text-[#94a3b8]" />
              <span className="font-['Spline_Sans',sans-serif] font-medium text-[#64748b] text-[14px] leading-3.5">
                1h 15m
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#f8fafc] border-t border-[#f1f5f9] flex items-center justify-center py-4 w-full cursor-pointer hover:bg-[#f1f5f9] transition-colors">
          <span className="font-['Spline_Sans',sans-serif] font-semibold text-[#64748b] text-[10px] tracking-[1px] uppercase leading-4">
            VIEW ALL TASKS
          </span>
        </div>
      </div>

      <div className="sticky bottom-8 z-50 w-full mt-auto">
        <div className="backdrop-blur-md bg-[rgba(255,255,255,0.9)] border border-[#e2e8f0] drop-shadow-[0px_8px_15px_rgba(0,0,0,0.08)] flex h-16 items-center justify-between px-4.25 py-px rounded-3xl w-full">
          <div className="flex gap-4 items-center">
            <div className="bg-[#f5f3ff] border border-[#ede9fe] flex items-center justify-center rounded-2xl w-10 h-10 shrink-0">
              <Timer className="w-4.5 h-4.5 text-cu-purple" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-['Spline_Sans',sans-serif] font-bold text-cu-purple text-[10px] leading-4 tracking-[1px] uppercase">
                ACTIVE FOCUS
              </span>
              <span className="font-['Spline_Sans',sans-serif] font-semibold text-[#0f172a] text-[14px] leading-5">
                Design System Documentation
              </span>
            </div>
          </div>

          <div className="flex gap-6 items-center">
            <span className="font-['Spline_Sans',sans-serif] font-bold text-[#0f172a] text-[18px] leading-6">
              24:18
            </span>
            <div className="flex gap-2 items-center">
              <button className="bg-[#f1f5f9] hover:bg-[#e2e8f0] transition-colors border-none flex items-center justify-center rounded-xl w-8 h-8 cursor-pointer">
                <Pause className="w-3.5 h-3.5 text-[#475569] fill-[#475569]" />
              </button>
              <button className="bg-[#f1f5f9] hover:bg-[#e2e8f0] transition-colors border-none flex items-center justify-center rounded-xl w-8 h-8 cursor-pointer">
                <Square className="w-3 h-3 text-[#475569] fill-[#475569]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
