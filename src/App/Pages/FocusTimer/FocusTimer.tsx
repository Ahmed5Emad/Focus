import { useEffect, useState } from 'react';
import { useFocus } from '@/contexts/FocusContext';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Square, Play, Pause, AlertCircle, Clock, Activity, ChevronDown, ChevronUp, Settings2 } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

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
  const { activeSession, isActive, isPaused, secondsElapsed, pauseSession, resumeSession, stopSession, logDistraction } = useFocus();
  const { user } = useAuth();
  const [supabase] = useState(() => createClient());
  
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
  }, [user, supabase, activeSession]);

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
    
    if (activeSession) {
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
    }
  }, [activeSession, supabase]);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-3 px-6 rounded-xl transition-colors flex items-center gap-2"
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
                className="bg-[#0f172a] hover:bg-[#1e293b] text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center gap-2 shadow-md"
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
            
            <p className="text-slate-500 text-center max-w-md mb-8">
              Start a session from your Tasks or Dashboard to begin tracking your deep work.
            </p>
          </>
        )}
      </div>

      <Collapsible
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        className="w-full space-y-6"
      >
        <div className="flex items-center justify-center">
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full px-6"
            >
              <Settings2 className="w-4 h-4" />
              <span>{isDetailsOpen ? 'Hide' : 'Show'} Session Details & History</span>
              {isDetailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
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
                    className="bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold py-2 rounded-lg transition-colors border border-slate-200"
                  >
                    + Internal
                  </button>
                  <button 
                    onClick={() => logDistraction('external', 'minor')}
                    className="bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold py-2 rounded-lg transition-colors border border-slate-200"
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
                <div className="animate-pulse flex flex-col gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-slate-100 rounded-xl w-full"></div>
                  ))}
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No sessions recorded yet.
                </div>
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
                        <tr key={session.id} className="border-b border-slate-100 last:border-0">
                          <td className="py-4 text-sm font-medium text-slate-900">
                            {session.tasks?.title ?? (session.task_id ? 'Task session' : 'Unassigned Task')}
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
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
                              session.status === 'completed' ? 'bg-[#f0fdf4] text-cu-green' :
                              session.status === 'active' ? 'bg-[#f5f3ff] text-cu-purple' :
                              'bg-slate-100 text-slate-500'
                            }`}>
                              {session.status}
                            </span>
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
    </div>
  );
}
