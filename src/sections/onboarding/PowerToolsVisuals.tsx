import React from 'react';

interface PowerToolsVisualsProps {
  readonly className?: string;
}

export const PowerToolsVisuals: React.FC<PowerToolsVisualsProps> = ({ className = '' }) => {
  return (
    <div className={`lg:col-span-7 grid grid-cols-6 grid-rows-6 gap-4 h-[600px] ${className}`}>
      {/* Command Palette Mockup */}
      <div className="col-span-6 row-span-3 bg-white rounded-xl shadow-lg p-6 border border-slate-100 relative">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
          <span className="material-symbols-outlined text-cu-purple">search</span>
          <span className="text-slate-400">Search or type a command...</span>
          <div className="ml-auto flex gap-1">
            <kbd className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold">⌘</kbd>
            <kbd className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold">K</kbd>
          </div>
        </div>
        <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 bg-cu-purple/10 rounded-lg">
                <span className="material-symbols-outlined text-cu-purple">description</span>
                <span className="text-slate-900 font-medium">Product Requirements Doc</span>
            </div>
            <div className="flex items-center gap-3 p-2 text-slate-600">
                <span className="material-symbols-outlined">bolt</span>
                <span>Create new Sprint</span>
            </div>
        </div>
      </div>
      {/* Knowledge Graph & Metric Card */}
      <div className="col-span-4 row-span-3 bg-slate-50 rounded-xl p-6 border border-slate-100 flex items-center justify-center">
        <span className="text-slate-400 font-bold">Knowledge Graph Visualization</span>
      </div>
      <div className="col-span-2 row-span-3 bg-cu-purple text-white rounded-xl p-6 flex flex-col justify-between">
        <span className="material-symbols-outlined text-3xl">timer</span>
        <h4 className="text-4xl font-bold">40%</h4>
        <p className="text-sm opacity-80">Faster workflow</p>
      </div>
    </div>
  );
};

export default PowerToolsVisuals;
