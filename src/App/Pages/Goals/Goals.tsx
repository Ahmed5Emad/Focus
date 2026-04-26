import { Target, Plus } from 'lucide-react';

export default function Goals() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full px-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-[0px_12px_32px_rgba(0,0,0,0.08)] border border-outline-variant/30 p-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-6">
          <Target className="w-8 h-8 text-primary" />
        </div>
        
        <h2 className="font-headline-md text-headline-md text-on-surface mb-2">
          No goals set
        </h2>
        
        <p className="font-body-md text-body-md text-on-surface-variant mb-8 max-w-[280px]">
          Create your first goal to start tracking your progress and achieving your targets.
        </p>
        
        <button className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg font-button text-button hover:bg-primary/90 transition-colors shadow-sm">
          <Plus className="w-5 h-5" />
          Create Goal
        </button>
      </div>
    </div>
  );
}
