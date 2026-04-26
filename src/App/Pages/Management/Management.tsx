import { Target, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Management() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full px-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-[0px_12px_32px_rgba(0,0,0,0.08)] border border-outline-variant/30 p-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
          <Target className="w-8 h-8" />
        </div>
        
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">
          No active tasks or goals
        </h2>
        
        <p className="font-body-md text-body-md text-on-surface-variant mb-8 max-w-sm">
          Get started by creating your first task or goal to manage your workflow and track your progress.
        </p>
        
        <Button className="w-full sm:w-auto font-button text-button bg-primary text-on-primary hover:bg-primary/90 h-10 px-6 rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create New Task
        </Button>
      </div>
    </div>
  );
}
