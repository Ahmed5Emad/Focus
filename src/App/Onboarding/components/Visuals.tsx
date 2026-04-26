import React from 'react';
import { BrainCircuit, CheckCircle2, TrendingUp, BellRing } from 'lucide-react';

interface VisualsProps {
  readonly className?: string;
}

export const Visuals: React.FC<VisualsProps> = ({ className = '' }) => {
  return (
    <div className={`lg:col-span-6 relative h-[600px] hidden lg:flex items-center justify-center ${className}`}>
      <div className="absolute w-full h-full flex items-center justify-center">
        {/* Main Dashboard Mockup Card */}
        <div className="relative z-20 w-[420px] bg-white rounded-xl shadow-[0px_12px_32px_rgba(0,0,0,0.08)] p-6 border border-slate-100 -rotate-3 hover:rotate-0 transition-transform duration-500">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cu-red"></div>
              <div className="w-3 h-3 rounded-full bg-cu-blue"></div>
              <div className="w-3 h-3 rounded-full bg-cu-purple"></div>
            </div>
            <div className="h-2 w-24 bg-slate-100 rounded-full"></div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="w-10 h-10 rounded bg-cu-purple/10 flex items-center justify-center text-cu-purple">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="h-3 w-32 bg-slate-200 rounded mb-2"></div>
                <div className="h-2 w-20 bg-slate-100 rounded"></div>
              </div>
              <CheckCircle2 className="text-cu-purple w-6 h-6" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-32 bg-cu-blue/10 rounded-lg p-4">
                <div className="h-2 w-12 bg-cu-blue rounded mb-2"></div>
                <div className="flex items-end h-16 gap-1">
                  <div className="w-2 h-[40%] bg-cu-blue/40 rounded-full"></div>
                  <div className="w-2 h-[70%] bg-cu-blue/40 rounded-full"></div>
                  <div className="w-2 h-[100%] bg-cu-blue rounded-full"></div>
                  <div className="w-2 h-[60%] bg-cu-blue/40 rounded-full"></div>
                </div>
              </div>
              <div className="h-32 bg-cu-red/10 rounded-lg p-4">
                <div className="h-2 w-12 bg-cu-red rounded mb-2"></div>
                <div className="h-12 w-12 rounded-full border-4 border-cu-red/20 border-t-cu-red flex items-center justify-center mx-auto mt-2">
                  <span className="text-[10px] font-bold text-cu-red">82%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Floater: Analytics */}
        <div className="absolute top-10 right-0 z-30 w-56 bg-white rounded-xl shadow-[0px_12px_32px_rgba(0,0,0,0.06)] p-4 border border-slate-50 rotate-6 hover:scale-105 transition-transform">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-cu-blue w-6 h-6" />
            <span className="font-bold text-sm text-slate-900">Productivity Peak</span>
          </div>
          <div className="w-full h-20 bg-slate-100 rounded"></div>
        </div>
        {/* Floater: User Task */}
        <div className="absolute bottom-12 -left-4 z-10 w-64 bg-slate-900 text-white rounded-xl shadow-2xl p-4 -rotate-6 hover:rotate-0 transition-all">
          <div className="flex items-start gap-4">
            <div className="bg-cu-purple p-2 rounded-full">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold opacity-70 uppercase tracking-widest">Focus Mode Active</p>
              <p className="text-sm font-medium mt-1">Refining Neural Engine v4.0</p>
              <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
                <div className="bg-cu-blue h-full w-[65%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visuals;
