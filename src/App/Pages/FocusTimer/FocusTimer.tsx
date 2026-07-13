import { useEffect, useState } from 'react';
import { useFocus } from '@/contexts/FocusContext';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Square, Play, Pause, AlertCircle, Clock, Activity, ChevronDown, ChevronUp, Settings2, MoreHorizontal, Pencil, Trash2, Folder, Timer } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dropdown } from "@/components/shared/Dropdown";
import { EmptyState } from "@/components/shared/EmptyState";
import { toast } from "sonner";
import { SessionEditDialog } from "./components/SessionEditDialog";
import { Skeleton } from "@/components/ui/skeleton";

interface SessionHistory {
  id: string;
  task_id: string | null;
  start_time: string;
  end_time: string | null;
  status: string;
  flow_score: number | null;
  actual_duration_seconds: number;
  tasks?: { title: string } | null;
}

interface DistractionLog {
  id: string;
  type: 'internal' | 'external';
  severity: 'minor' | 'major';
  timestamp: string;
}

const formatTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function FocusTimer() {
  const { activeSession, isActive, isPaused, secondsElapsed, startSession, pauseSession, resumeSession, stopSession, logDistraction, deleteSession, updateSession } = useFocus();
  const { user, currentWorkspaceId } = useAuth();
  const [history, setHistory] = useState<SessionHistory[]>([]);
  const [currentLogs, setCurrentLogs] = useState<DistractionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('focus_sessions')
        .select('*, tasks!focus_sessions_task_id_fkey(title)')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false })
        .limit(10);
        
      if (!error && data) {
        setHistory(data as SessionHistory[]);
      }
      setIsLoading(false);
    };
    
    fetchHistory();
  }, [user, activeSession]);

  useEffect(() => {
    const fetchCurrentLogs = async () => {
      if (!activeSession) {
        setCurrentLogs([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('distraction_logs')
        .select('*')
        .eq('session_id', activeSession.id)
        .order('timestamp', { ascending: false });
        
      if (!error && data) {
        setCurrentLogs(data);
      }
    };
    
    fetchCurrentLogs();

    if (!activeSession) return;

    const channel = supabase
      .channel('distraction_logs_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'distraction_logs',
          filter: `session_id=eq.${activeSession.id}`
        },
        (payload) => {
          setCurrentLogs(prev => [payload.new as DistractionLog, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeSession]);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [editSession, setEditSession] = useState<SessionHistory | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [allTasks, setAllTasks] = useState<{ id: string; title: string }[]>([]);
  const [startTaskId, setStartTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentWorkspaceId) return;
    const fetchTasks = async () => {
      const { data } = await supabase
        .from("tasks")
        .select("id, title")
        .eq("workspace_id", currentWorkspaceId)
        .order("created_at", { ascending: false });
      setAllTasks(data ?? []);
    };
    fetchTasks();
  }, [currentWorkspaceId]);

  const handleEdit = (session: SessionHistory) => {
    setEditSession(session);
    setEditOpen(true);
  };

  const handleDeleteClick = (sessionId: string) => {
    setDeleteTargetId(sessionId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    const success = await deleteSession(deleteTargetId);
    if (success) {
      setHistory((prev) => prev.filter((s) => s.id !== deleteTargetId));
      toast.success("Session deleted");
    } else {
      toast.error("Failed to delete session");
    }
    setDeleteConfirmOpen(false);
    setDeleteTargetId(null);
  };

  const handleSaveEdit = async (sessionId: string, updates: { task_id: string | null; status: string; actual_duration_seconds: number }) => {
    const success = await updateSession(sessionId, updates);
    if (success) {
      const task = updates.task_id ? allTasks.find((t) => t.id === updates.task_id) : null;
      setHistory((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, ...updates, tasks: task ? { title: task.title } : null }
            : s
        )
      );
    }
    return success;
  };

  const handleAssignTask = async (sessionId: string, taskId: string | null) => {
    const success = await updateSession(sessionId, { task_id: taskId });
    if (success) {
      const task = taskId ? allTasks.find((t) => t.id === taskId) : null;
      setHistory((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, task_id: taskId, tasks: task ? { title: task.title } : null }
            : s
        )
      );
      toast.success(task ? "Task assigned" : "Task unassigned");
    } else {
      toast.error("Failed to assign task");
    }
  };

  return (
    <div className="page-container">
      <div className="flex flex-col gap-2 pt-6">
        <h1 className="page-title">Focus Timer</h1>
        <p className="page-description">Manage your deep work sessions and track distractions.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cu-purple to-cu-pink opacity-20"></div>
        
        {isActive ? (
          <>
            <div className="bg-[#f5f3ff] text-cu-purple px-4 py-1.5 rounded-full text-sm font-semibold mb-8 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cu-purple animate-pulse"></div>
              ACTIVE SESSION
            </div>
            
            <h2 className="text-2xl font-semibold text-slate-900 mb-2 text-center">
              {activeSession?.task_id ? 'Focusing on task' : 'Unassigned Task'}
            </h2>
            
            <div className="text-[80px] font-bold text-slate-900 font-['Spline_Sans',sans-serif] tracking-tight leading-none mb-12">
              {formatTime(secondsElapsed)}
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => isPaused ? resumeSession() : pauseSession()}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-3 px-6 rounded-xl transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label={isPaused ? "Resume focus session" : "Pause focus session"}
              >
                {isPaused ? (
                  <Play className="w-5 h-5" />
                ) : (
                  <Pause className="w-5 h-5" />
                )}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button 
                onClick={() => stopSession()}
                className="bg-[#0f172a] hover:bg-[#1e293b] text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center gap-2 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Stop focus session"
              >
                <Square className="w-5 h-5" />
                Stop Session
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-sm font-semibold mb-8">
              READY TO FOCUS
            </div>
            
            <div className="text-[80px] font-bold text-slate-400 font-['Spline_Sans',sans-serif] tracking-tight leading-none mb-12">
              00:00
            </div>
            
            <div className="flex flex-col items-center gap-4 mb-8 w-full max-w-xs">
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">Select Task</label>
                <Dropdown
                  value={startTaskId}
                  onValueChange={setStartTaskId}
                  options={allTasks.map((t) => ({ value: t.id, label: t.title }))}
                  placeholder="Choose a task to focus on..."
                  searchPlaceholder="Search tasks..."
                  emptyText="No task found."
                  noneLabel="No Task (Free Focus)"
                  icon={<Folder className="w-4 h-4 text-slate-400" />}
                />
              </div>
              <Button
                onClick={async () => {
                  if (!currentWorkspaceId) return;
                  await startSession(startTaskId, currentWorkspaceId);
                }}
                className="btn-primary w-full"
              >
                <Play className="w-4 h-4" />
                <span className="font-semibold tracking-wide uppercase text-[12px]">
                  {startTaskId ? "Start Focus Session" : "Start Free Focus"}
                </span>
              </Button>
            </div>
          </>
        )}
      </div>

      <Collapsible
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        className="w-full space-y-3"
      >
        <div className="flex items-center justify-center">
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full px-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={isDetailsOpen ? "Hide session details" : "Show session details"}
            >
              <Settings2 className="w-4 h-4" />
              <span>{isDetailsOpen ? 'Hide' : 'Show'} Session Details & History</span>
              {isDetailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-cu-orange" />
                  Distractions
                </h3>
                {isActive && (
                  <span className="bg-[#fff7ed] text-cu-orange text-xs font-bold px-2.5 py-1 rounded-full">
                    {currentLogs.length}
                  </span>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {!isActive ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm">Start a session to log distractions</p>
                  </div>
                ) : currentLogs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                      <span className="text-xl">🎯</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500">Zero distractions!</p>
                    <p className="text-xs mt-1">Keep up the great work.</p>
                  </div>
                ) : (
                  currentLogs.map(log => (
                    <div key={log.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${log.severity === 'major' ? 'bg-red-500' : 'bg-amber-400'}`} />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-slate-900 capitalize">{log.type}</span>
                          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            {log.severity}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {isActive && (
                <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => logDistraction('internal', 'minor')}
                    className="bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold py-2 rounded-lg transition-colors border border-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Log internal distraction"
                  >
                    + Internal
                  </button>
                  <button 
                    onClick={() => logDistraction('external', 'minor')}
                    className="bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold py-2 rounded-lg transition-colors border border-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Log external distraction"
                  >
                    + External
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-cu-blue" />
                Recent Sessions
              </h3>
              
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : history.length === 0 ? (
                <EmptyState
                  icon={Timer}
                  title="No sessions recorded yet"
                  description="Start a focus session to see your history here."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="pb-3 font-semibold text-slate-500 text-sm">Task</th>
                        <th className="pb-3 font-semibold text-slate-500 text-sm">Date</th>
                        <th className="pb-3 font-semibold text-slate-500 text-sm">Duration</th>
                        <th className="pb-3 font-semibold text-slate-500 text-sm">Flow Score</th>
                        <th className="pb-3 font-semibold text-slate-500 text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map(session => (
                        <tr key={session.id} className="border-b border-slate-100 last:border-0 group">
                          <td className="py-4 text-sm font-medium text-slate-900">
                            <div className="flex items-center gap-2">
                              <Dropdown
                                value={session.task_id}
                                onValueChange={(val) => handleAssignTask(session.id, val)}
                                options={allTasks.map((t) => ({ value: t.id, label: t.title }))}
                                placeholder="Unassigned"
                                searchPlaceholder="Search tasks..."
                                emptyText="No task found."
                                noneLabel="Unassigned"
                                icon={<Folder className="w-3.5 h-3.5 text-slate-400" />}
                                triggerClassName="border-0 bg-transparent hover:bg-slate-50 px-1 py-0 h-auto text-sm font-medium text-slate-900"
                              />
                            </div>
                          </td>
                          <td className="py-4 text-sm text-slate-500">
                            {new Date(session.start_time).toLocaleDateString()}
                          </td>
                          <td className="py-4 text-sm text-slate-900 font-medium">
                            {formatTime(session.actual_duration_seconds)}
                          </td>
                          <td className="py-4">
                            {session.flow_score !== null ? (
                              <div className="flex items-center gap-1.5">
                                <Activity className="w-4 h-4 text-cu-green" />
                                <span className="text-sm font-bold text-slate-900">{session.flow_score}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
                                session.status === 'completed' ? 'bg-[#f0fdf4] text-cu-green' :
                                session.status === 'active' ? 'bg-[#f5f3ff] text-cu-purple' :
                                'bg-slate-100 text-slate-500'
                              }`}>
                                {session.status}
                              </span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                    aria-label="Session actions"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44 rounded-xl">
                                  <DropdownMenuItem
                                    className="text-slate-600 cursor-pointer"
                                    onClick={() => handleEdit(session)}
                                  >
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600 cursor-pointer"
                                    onClick={() => handleDeleteClick(session.id)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <SessionEditDialog
        key={editSession?.id}
        session={editSession}
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditSession(null);
        }}
        onSave={handleSaveEdit}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Session"
        description="Are you sure you want to delete this session? This cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
}
