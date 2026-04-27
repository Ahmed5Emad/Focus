import { MoreHorizontal, CheckSquare, Calendar, Trophy } from "lucide-react";

export default function Goals() {
  return (
    <div className="flex-1 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-['Spline_Sans',sans-serif] text-[48px] leading-[1.1] tracking-[-0.02em] font-bold text-[#0b1c30] mb-2">My Goals</h1>
          <p className="font-['Inter',sans-serif] text-[18px] leading-[1.6] text-[#494454]">Track your long-term ambitions and milestones.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[#eff4ff] rounded-full p-1 flex">
            <button className="px-4 py-2 rounded-full bg-[#d3e4fe] text-[#0b1c30] font-['Space_Grotesk',sans-serif] text-[14px] font-semibold leading-none shadow-sm">Active</button>
            <button className="px-4 py-2 rounded-full text-[#494454] hover:text-[#0b1c30] font-['Space_Grotesk',sans-serif] text-[14px] font-semibold leading-none">Completed</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="col-span-1 md:col-span-8 bg-white rounded-xl p-6 shadow-[0px_4px_12px_rgba(139,92,246,0.04)] border border-slate-100 flex flex-col justify-between hover:-translate-y-0.5 transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="font-['Spline_Sans',sans-serif] text-[24px] leading-[1.3] font-semibold text-[#0b1c30]">Launch SaaS Product</h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#57dffe] text-[#006172] font-['Space_Grotesk',sans-serif] text-[12px] font-bold leading-none tracking-[0.05em] mt-2">Work</span>
            </div>
            <button className="text-[#7b7486] hover:text-[#6b38d4] transition-colors">
              <MoreHorizontal className="w-6 h-6" />
            </button>
          </div>
          <p className="font-['Inter',sans-serif] text-[16px] leading-[1.5] text-[#494454] mb-6 max-w-xl">Complete beta testing, finalize marketing copy, and execute the soft launch strategy by Q3.</p>
          
          <div className="mt-auto">
            <div className="flex justify-between font-['Inter',sans-serif] text-[14px] leading-[1.4] text-[#494454] mb-2">
              <span>Progress</span>
              <span className="font-semibold text-[#6b38d4]">65%</span>
            </div>
            <div className="w-full bg-[#e5eeff] h-2 rounded-full overflow-hidden">
              <div className="bg-[#00687a] h-full rounded-full" style={{ width: '65%' }}></div>
            </div>
            <div className="mt-4 flex gap-2">
              <div className="flex items-center gap-1 text-[#494454] font-['Inter',sans-serif] text-[14px] leading-[1.4] bg-[#eff4ff] px-3 py-1.5 rounded-lg">
                <CheckSquare className="w-[18px] h-[18px]" />
                <span>12/18 Tasks</span>
              </div>
              <div className="flex items-center gap-1 text-[#494454] font-['Inter',sans-serif] text-[14px] leading-[1.4] bg-[#eff4ff] px-3 py-1.5 rounded-lg">
                <Calendar className="w-[18px] h-[18px]" />
                <span>Due Oct 15</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-4 bg-white rounded-xl p-6 shadow-[0px_4px_12px_rgba(139,92,246,0.04)] border border-slate-100 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 transition-transform duration-300">
          <h3 className="font-['Spline_Sans',sans-serif] text-[24px] leading-[1.3] font-semibold text-[#0b1c30] mb-4">Marathon Training</h3>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#dc2c4f] text-[#fffbff] font-['Space_Grotesk',sans-serif] text-[12px] font-bold leading-none tracking-[0.05em] mb-6">Health</span>
          
          <div className="relative w-32 h-32 mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-[#e5eeff] stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3"></path>
              <path className="text-[#6b38d4] stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeDasharray="45, 100" strokeWidth="3"></path>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="font-['Spline_Sans',sans-serif] text-[32px] leading-[1.2] tracking-[-0.01em] font-semibold text-[#0b1c30]">45%</span>
            </div>
          </div>
          <p className="font-['Inter',sans-serif] text-[14px] leading-[1.4] text-[#494454]">Next: 10k Weekend Run</p>
        </div>

        <div className="col-span-1 md:col-span-6 bg-white rounded-xl p-6 shadow-[0px_4px_12px_rgba(139,92,246,0.04)] border border-slate-100 hover:-translate-y-0.5 transition-transform duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-['Spline_Sans',sans-serif] text-[24px] leading-[1.3] font-semibold text-[#0b1c30]">Upcoming Milestones</h3>
            <button className="text-[#6b38d4] font-['Space_Grotesk',sans-serif] text-[14px] font-semibold leading-none hover:underline">View All</button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-start gap-4 p-2 hover:bg-[#eff4ff] rounded-lg transition-colors">
              <div className="mt-1 w-6 h-6 rounded-full border-2 border-[#6b38d4] flex items-center justify-center shrink-0">
                <div className="w-3 h-3 bg-[#6b38d4] rounded-full"></div>
              </div>
              <div className="flex-1">
                <h4 className="font-['Space_Grotesk',sans-serif] text-[14px] font-semibold leading-none text-[#0b1c30] mb-1">Finalize UI Mockups</h4>
                <p className="font-['Inter',sans-serif] text-[14px] leading-[1.4] text-[#494454]">SaaS Launch • Due Tomorrow</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-2 hover:bg-[#eff4ff] rounded-lg transition-colors">
              <div className="mt-1 w-6 h-6 rounded-full border-2 border-[#7b7486] flex items-center justify-center shrink-0">
              </div>
              <div className="flex-1">
                <h4 className="font-['Space_Grotesk',sans-serif] text-[14px] font-semibold leading-none text-[#0b1c30] mb-1">Run 15km continuous</h4>
                <p className="font-['Inter',sans-serif] text-[14px] leading-[1.4] text-[#494454]">Marathon Training • Due Saturday</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-2 hover:bg-[#eff4ff] rounded-lg transition-colors">
              <div className="mt-1 w-6 h-6 rounded-full border-2 border-[#7b7486] flex items-center justify-center shrink-0">
              </div>
              <div className="flex-1">
                <h4 className="font-['Space_Grotesk',sans-serif] text-[14px] font-semibold leading-none text-[#0b1c30] mb-1">Draft Chapter 1</h4>
                <p className="font-['Inter',sans-serif] text-[14px] leading-[1.4] text-[#494454]">Write Novel • Due in 5 days</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-6 rounded-xl p-6 shadow-[0px_4px_12px_rgba(139,92,246,0.04)] border border-slate-100 bg-gradient-to-br from-[#e9ddff] to-[#dce9ff] flex flex-col justify-center items-center text-center hover:-translate-y-0.5 transition-transform duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#6b38d4] via-transparent to-transparent"></div>
          <Trophy className="w-12 h-12 text-[#6b38d4] mb-4" />
          <h3 className="font-['Spline_Sans',sans-serif] text-[24px] leading-[1.3] font-semibold text-[#0b1c30] mb-2">Ready for a new challenge?</h3>
          <p className="font-['Inter',sans-serif] text-[16px] leading-[1.5] text-[#494454] mb-6">Define a new objective and start tracking your progress today.</p>
          <button className="bg-[#6b38d4] text-[#ffffff] font-['Space_Grotesk',sans-serif] text-[14px] font-semibold leading-none py-2 px-6 rounded-lg hover:bg-[#8455ef] transition-colors shadow-sm z-10">
            Create Goal
          </button>
        </div>
      </div>
    </div>
  );
}
