import { Target, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Management() {
  return (
    <div className="page-container pt-6">
      <div className="flex flex-col gap-1">
        <h1 className="page-title">Management</h1>
        <p className="page-description">Manage your workflow and track team progress.</p>
      </div>
      <div className="content-card flex flex-col items-center justify-center py-24 px-6">
        <div className="max-w-md text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-cu-purple/10 text-cu-purple flex items-center justify-center mb-4">
            <Target className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            No active tasks or goals
          </h2>
          <p className="text-slate-500 max-w-sm mb-6">
            Get started by creating your first task or goal to manage your workflow and track your progress.
          </p>
          <Link to="/tasks/new">
            <Button className="btn-primary">
              <Plus className="w-4 h-4" />
              Create New Task
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
