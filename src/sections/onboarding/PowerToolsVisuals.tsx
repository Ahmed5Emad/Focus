import React from 'react';

interface PowerToolsVisualsProps {
  readonly className?: string;
}

export const PowerToolsVisuals: React.FC<PowerToolsVisualsProps> = ({ className = '' }) => {
  return (
    <div className={`lg:col-span-7 grid grid-cols-6 grid-rows-6 gap-4 h-[600px] ${className}`}>
      {/* Command Palette Mockup (Top) */}
      <div className="col-span-6 row-span-3 glass-panel rounded-xl shadow-[0px_12px_32px_rgba(0,0,0,0.08)] p-6 overflow-hidden relative border border-slate-200">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-4">
          <span className="material-symbols-outlined text-cu-purple">search</span>
          <span className="text-slate-500 font-medium">Search or type a command...</span>
          <div className="ml-auto flex gap-1">
            <kbd className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[10px] font-bold">⌘</kbd>
            <kbd className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[10px] font-bold">K</kbd>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-4 p-3 bg-cu-purple/10 rounded-lg border border-cu-purple/10">
            <span className="material-symbols-outlined text-cu-purple">description</span>
            <span className="font-medium text-slate-900">Product Requirements Doc</span>
            <span className="ml-auto text-xs text-slate-500">Recently opened</span>
          </div>
          <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-slate-500">bolt</span>
            <span className="font-medium text-slate-900">Create new Sprint</span>
            <span className="ml-auto text-xs text-slate-500">Action</span>
          </div>
          <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-slate-500">person_search</span>
            <span className="font-medium text-slate-900">Find Sarah Chen</span>
            <span className="ml-auto text-xs text-slate-500">Member</span>
          </div>
        </div>
        {/* Gradient Overlay for depth */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent"></div>
      </div>
      
      {/* Knowledge Graph Visualization (Bottom Left) */}
      <div className="col-span-4 row-span-3 glass-panel rounded-xl shadow-[0px_4px_12px_rgba(139,92,246,0.04)] relative overflow-hidden border border-slate-100 bg-slate-50">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-violet-200 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-violet-100 rounded-full"></div>
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-cu-purple rounded-full"></div>
          <div className="absolute top-3/4 left-1/3 w-2 h-2 bg-cu-blue rounded-full"></div>
          <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-cu-purple/50 rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-cu-blue/50 rounded-full"></div>
        </div>
        <div className="absolute bottom-4 left-4 p-4 glass-panel rounded-lg shadow-sm">
          <p className="font-bold text-[10px] text-cu-purple tracking-widest uppercase">Live Graph</p>
          <p className="font-bold text-sm text-slate-900">Visualizing 1,242 nodes</p>
        </div>
      </div>

      {/* Small Metric Card (Bottom Right) */}
      <div className="col-span-2 row-span-3 bg-cu-purple rounded-xl shadow-lg p-6 flex flex-col justify-between text-white relative overflow-hidden">
        <div className="relative z-10">
          <span className="material-symbols-outlined text-3xl">timer</span>
          <h4 className="text-4xl font-bold mt-2">40%</h4>
          <p className="text-xs opacity-80">Faster workflow completion</p>
        </div>
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="mt-auto relative z-10">
          <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
            <div className="bg-cu-blue h-full w-[85%]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PowerToolsVisuals;
