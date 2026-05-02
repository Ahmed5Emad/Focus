import { useState, useEffect } from 'react';
import { Plus, Calendar, Folder, ArrowRight, CornerDownLeft, Check, ChevronsUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface Project {
  id: string;
  title: string;
}


interface Task {
  id: string;
  title: string;
}

export default function TaskCreation() {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScheduledForToday, setIsScheduledForToday] = useState(false);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [parentTasks, setParentTasks] = useState<Task[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedParentTaskId, setSelectedParentTaskId] = useState<string | null>(null);
  const [isParentTaskOpen, setIsParentTaskOpen] = useState(false);

  const navigate = useNavigate();
  const { user, currentWorkspaceId } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!currentWorkspaceId) return;

      const fetchData = async () => {
        setIsLoadingData(true);
        try {
        const [projectsRes, tasksRes] = await Promise.all([
          supabase.from('projects').select('id, title').eq('workspace_id', currentWorkspaceId),
          supabase.from('tasks').select('id, title').eq('workspace_id', currentWorkspaceId).neq('status', 'done')
        ]);

        console.log('Projects fetch response:', projectsRes);
        console.log('Tasks fetch response:', tasksRes);

        if (projectsRes.data) setProjects(projectsRes.data);
          if (tasksRes.data) setParentTasks(tasksRes.data);
        } catch (error) {
          console.error('Error fetching relationship data:', error);
        } finally {
          setIsLoadingData(false);
        }
      };


    fetchData();
  }, [currentWorkspaceId, supabase]);

  const createTask = async () => {
    if (!inputValue.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .insert([{ 
          title: inputValue.trim(), 
          workspace_id: currentWorkspaceId,
          user_id: user?.id,
          project_id: selectedProjectId,
          parent_task_id: selectedParentTaskId
        }]);
      
      if (error) throw error;
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate('/dashboard');
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [navigate]);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      navigate('/dashboard');
      return;
    }

    if (e.key === 'Enter' && inputValue.trim() && !isSubmitting) {
      await createTask();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full px-4">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-xl shadow-2xl overflow-hidden flex flex-col border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 relative">
          <Plus className="text-zinc-400 w-6 h-6 mr-3" />
          <input
            autoFocus
            className="w-full bg-transparent border-none outline-none text-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-0 p-0 h-10"
            placeholder="What needs to be done?"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSubmitting}
          />
          <div className="flex items-center gap-2 ml-3">
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">
              Enter <CornerDownLeft className="w-3 h-3" />
            </kbd>
          </div>
        </div>

        <div className="overflow-y-auto p-4 flex-1 bg-zinc-50/50 dark:bg-zinc-900/50">
          {inputValue.length === 0 ? (
            <>
              <div className="mb-4">
                <div className="px-3 py-2 mb-1 flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Quick Actions</span>
                  {isLoadingData && <span className="text-[10px] text-zinc-400 animate-pulse">Loading data...</span>}
                </div>
                
                <div className="space-y-4 p-1">
                  <button 
                    onClick={() => setIsScheduledForToday(!isScheduledForToday)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 group transition-colors ${isScheduledForToday ? 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <span className="font-medium">Schedule for Today {isScheduledForToday && '(Scheduled)'}</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <kbd className="text-xs text-zinc-400 bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded">⌘</kbd>
                      <kbd className="text-xs text-zinc-400 bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded">T</kbd>
                    </div>
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight ml-1">Project</label>
                      <Select value={selectedProjectId || "none"} onValueChange={(val) => setSelectedProjectId(val === "none" ? null : val)}>
                        <SelectTrigger className="w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-11">
                          <div className="flex items-center gap-2">
                            <Folder className="w-4 h-4 text-purple-500" />
                            <SelectValue placeholder="Select Project" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Project</SelectItem>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>{project.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight ml-1">Parent Task</label>
                      <Popover open={isParentTaskOpen} onOpenChange={setIsParentTaskOpen}>
                        <PopoverTrigger asChild>
                          <button
                            role="combobox"
                            aria-expanded={isParentTaskOpen}
                            className="w-full flex items-center justify-between px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors h-11"
                          >
                            <div className="flex items-center gap-2">
                              <CornerDownLeft className="w-4 h-4 text-orange-500 rotate-180" />
                              <span className="truncate">
                                {selectedParentTaskId
                                  ? parentTasks.find((task) => task.id === selectedParentTaskId)?.title
                                  : "Select parent task..."}
                              </span>
                            </div>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search tasks..." />
                            <CommandList>
                              <CommandEmpty>No task found.</CommandEmpty>
                              <CommandGroup>
                                <CommandItem
                                  value="none"
                                  onSelect={() => {
                                    setSelectedParentTaskId(null)
                                    setIsParentTaskOpen(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedParentTaskId === null ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  No Parent Task
                                </CommandItem>
                                {parentTasks.map((task) => (
                                  <CommandItem
                                    key={task.id}
                                    value={task.id}
                                    onSelect={(currentValue) => {
                                      setSelectedParentTaskId(currentValue === selectedParentTaskId ? null : currentValue)
                                      setIsParentTaskOpen(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedParentTaskId === task.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {task.title}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                <ArrowRight className="w-6 h-6 text-zinc-400" />
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 font-medium">Press Enter to create task</p>
              <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1">"{inputValue}"</p>
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-4 text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <kbd className="text-[10px] font-medium bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded">Esc</kbd>
              <span className="text-xs">Close</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="text-[10px] font-medium bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded">↵</kbd>
              <span className="text-xs">Create Task</span>
            </div>
          </div>
          <div className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">
            Focus Tasks
          </div>
        </div>
      </div>
    </div>
  );
}
