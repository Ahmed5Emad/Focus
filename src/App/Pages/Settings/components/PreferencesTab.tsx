import { ListChecks, Folder } from 'lucide-react';
import { usePreferences } from '@/hooks/usePreferences';
import { Dropdown } from '@/components/shared/Dropdown';

export default function PreferencesTab() {
  const { preferences, updatePreference } = usePreferences();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card rounded-xl p-4 sm:p-6 shadow-sm border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-cu-purple/10 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Task Defaults</h3>
            <p className="text-sm text-muted-foreground">Configure default behavior for new tasks.</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-sm font-medium">Default status for new tasks</p>
              <p className="text-xs text-muted-foreground">Tasks created without explicit status will use this.</p>
            </div>
            <Dropdown
              value={preferences.defaultTaskStatus}
              onValueChange={(val) => val && updatePreference('defaultTaskStatus', val)}
              options={[{ value: "todo", label: "To Do" }, { value: "in_progress", label: "In Progress" }]}
              showSearch={false}
              triggerClassName="w-full sm:w-40 h-9 text-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-sm font-medium">Auto-assign to self</p>
              <p className="text-xs text-muted-foreground">New tasks are automatically assigned to you.</p>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={preferences.autoAssignToSelf} onChange={(e) => updatePreference('autoAssignToSelf', e.target.checked)} className="rounded border-input text-primary focus:ring-primary" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-sm font-medium">Auto-archive completed tasks</p>
              <p className="text-xs text-muted-foreground">Hide completed tasks after 7 days.</p>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={preferences.autoArchiveCompleted} onChange={(e) => updatePreference('autoArchiveCompleted', e.target.checked)} className="rounded border-input text-primary focus:ring-primary" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-sm font-medium">Show completed tasks</p>
              <p className="text-xs text-muted-foreground">Display completed tasks in the task list.</p>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={preferences.showCompletedTasks} onChange={(e) => updatePreference('showCompletedTasks', e.target.checked)} className="rounded border-input text-primary focus:ring-primary" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-4 sm:p-6 shadow-sm border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-cu-purple/10 flex items-center justify-center">
            <Folder className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Project Defaults</h3>
            <p className="text-sm text-muted-foreground">Manage how projects behave by default.</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-sm font-medium">Default project view</p>
              <p className="text-xs text-muted-foreground">Choose the default layout for projects.</p>
            </div>
            <Dropdown
              value={preferences.defaultProjectView}
              onValueChange={(val) => val && updatePreference('defaultProjectView', val)}
              options={[{ value: "list", label: "List" }, { value: "board", label: "Board" }]}
              showSearch={false}
              triggerClassName="w-full sm:w-40 h-9 text-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-sm font-medium">Auto-close completed projects</p>
              <p className="text-xs text-muted-foreground">Mark projects as completed when all tasks are done.</p>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={preferences.autoCloseCompletedProjects} onChange={(e) => updatePreference('autoCloseCompletedProjects', e.target.checked)} className="rounded border-input text-primary focus:ring-primary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
