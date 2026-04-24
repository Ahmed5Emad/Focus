import React from 'react';
import { Settings, Target, Zap, FileText, Circle, CheckCircle2 } from 'lucide-react';

interface DeepWorkVisualsProps {
  readonly className?: string;
}

export const DeepWorkVisuals: React.FC<DeepWorkVisualsProps> = ({ className = '' }) => {
  return (
    <div className={`lg:col-span-7 relative h-[500px] md:h-[600px] w-full ${className}`}>
      {/* Focus Timer Card */}
      <div className="absolute top-0 right-0 w-full md:w-3/4 bg-white rounded-xl shadow-[0px_12px_32px_rgba(0,0,0,0.08)] p-8 border border-slate-100 z-10 transform translate-y-4 hover:-translate-y-2 transition-transform duration-500">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cu-purple animate-pulse"></span>
            <span className="font-bold text-xs text-slate-500 uppercase tracking-widest">Deep Focus Session</span>
          </div>
          <Settings className="text-slate-400 w-6 h-6" />
        </div>
        <div className="flex flex-col items-center py-8">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Circular Progress Simulation */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle className="text-slate-100" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeWidth="8"></circle>
              <circle className="text-cu-purple" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeDasharray="552.92" strokeDashoffset="180" strokeWidth="8"></circle>
            </svg>
            <div className="text-center">
              <span className="text-5xl font-bold text-slate-950 block">24:00</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Time Left</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-slate-50 p-4 rounded-lg flex items-center gap-3">
            <Target className="text-cu-purple w-6 h-6" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Task</p>
              <p className="font-bold text-slate-900">Design System UI</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg flex items-center gap-3">
            <Zap className="text-cu-blue w-6 h-6" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Session Streak</p>
              <p className="font-bold text-slate-900">3 of 4</p>
            </div>
          </div>
        </div>
      </div>
      {/* Distraction Log Card (Overlapping) */}
      <div className="absolute bottom-4 left-0 w-full md:w-2/3 bg-white rounded-xl shadow-[0px_12px_32px_rgba(0,0,0,0.08)] p-6 border border-slate-100 z-20 transform -translate-x-12 -rotate-3 hover:rotate-0 transition-transform duration-500">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="text-cu-blue w-6 h-6 fill-cu-blue" />
          <h4 className="font-bold text-slate-950">Distraction Log</h4>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <Circle className="text-slate-400 w-6 h-6" />
            <span className="text-sm text-slate-500 italic">Add a thought to offload later...</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white border border-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-cu-blue w-5 h-5" />
              <span className="text-sm text-slate-900">Check grocery list for dinner</span>
            </div>
            <span className="text-[10px] text-slate-400">10:45 AM</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white border border-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-cu-blue w-5 h-5" />
              <span className="text-sm text-slate-900">Call bank about new card</span>
            </div>
            <span className="text-[10px] text-slate-400">10:22 AM</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeepWorkVisuals;
