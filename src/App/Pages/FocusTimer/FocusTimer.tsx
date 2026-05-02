import { useEffect, useState } from 'react';
import { useFocus } from '../../../contexts/FocusContext';
import { createClient } from '../../../lib/supabase/client';
import { useAuth } from '../../../contexts/AuthContext';
import { Square, Pause, AlertCircle, Clock, Activity, ChevronDown, ChevronUp, Settings2 } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../components/ui/collapsible";
import { Button } from "../../../components/ui/button";

interface SessionHistory {
  id: string;
  start_time: string;
  end_time: string | null;
  status: string;
  flow_score: number | null;
  actual_duration_seconds: number;
  tasks?: { title: string };
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
  const { activeSession, isActive, secondsElapsed, stopSession, logDistraction } = useFocus();
  const { user } = useAuth();
  const [supabase] = useState(() => createClient());
  
  const [history, setHistory] = useState<SessionHistory[]>([]);
  const [currentLogs, setCurrentLogs] = useState<DistractionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('focus_sessions')
        .select('*, tasks(title)')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false })
        .limit(10);
        
      if (!error && data) {
        setHistory(data);
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
        <p className="text-[#64748b] text-sm">Manage your deep work sessions and track distractions.</p>
      </div>

      <div className="bg-white rounded-3xl border border-[#e2e8f0] p-8 shadow-sm flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cu-purple to-cu-pink opacity-20"></div>
        
        {isActive ? (
          <>
            <div className="bg-[#f5f3ff] text-cu-purple px-4 py-1.5 rounded-full text-sm font-semibold mb-8 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cu-purple animate-pulse"></div>
              ACTIVE SESSION
            </div>
            
            <h2 className="text-2xl font-semibold text-[#0f172a] mb-2 text-center">
              {activeSession?.tasks?.title || 'Unassigned Task'}
            </h2>
            
            <div className="text-[80px] font-bold text-[#0f172a] font-['Spline_Sans',sans-serif] tracking-tight leading-none mb-12">
              {formatTime(secondsElapsed)}
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => stopSession()}
                className="bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#475569] font-semibold py-3 px-6 rounded-xl transition-colors flex items-center gap-2"
              >
                <Pause className="w-5 h-5" />
                Pause
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
            <div className="bg-[#f1f5f9] text-[#64748b] px-4 py-1.5 rounded-full text-sm font-semibold mb-8">
              READY TO FOCUS
            </div>
            
            <div className="text-[80px] font-bold text-[#94a3b8] font-['Spline_Sans',sans-serif] tracking-tight leading-none mb-12">
              00:00
            </div>
            
            <p className="text-[#64748b] text-center max-w-md mb-8">
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
              className="flex items-center gap-2 text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] rounded-full px-6"
            >
              <Settings2 className="w-4 h-4" />
              <span>{isDetailsOpen ? 'Hide' : 'Show'} Session Details & History</span>
              {isDetailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[#0f172a] flex items-center gap-2">
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
                  <div className="h-full flex flex-col items-center justify-center text-center text-[#94a3b8]">
                    <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm">Start a session to log distractions</p>
                  </div>
                ) : currentLogs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-[#94a3b8]">
                    <div className="w-12 h-12 rounded-full bg-[#f8fafc] flex items-center justify-center mb-3">
                      <span className="text-xl">🎯</span>
                    </div>
                    <p className="text-sm font-medium text-[#64748b]">Zero distractions!</p>
                    <p className="text-xs mt-1">Keep up the great work.</p>
                  </div>
                ) : (
                  currentLogs.map(log => (
                    <div key={log.id} className="bg-[#f8fafc] border border-[#f1f5f9] rounded-xl p-3 flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${log.severity === 'major' ? 'bg-red-500' : 'bg-amber-400'}`} />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-[#0f172a] capitalize">{log.type}</span>
                          <span className="text-[10px] font-medium text-[#64748b] uppercase tracking-wider bg-white px-1.5 py-0.5 rounded border border-[#e2e8f0]">
                            {log.severity}
                          </span>
                        </div>
                        <div className="text-xs text-[#64748b]">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {isActive && (
                <div className="mt-4 pt-4 border-t border-[#e2e8f0] grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => logDistraction('internal', 'minor')}
                    className="bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#475569] text-xs font-semibold py-2 rounded-lg transition-colors border border-[#e2e8f0]"
                  >
                    + Internal
                  </button>
                  <button 
                    onClick={() => logDistraction('external', 'minor')}
                    className="bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#475569] text-xs font-semibold py-2 rounded-lg transition-colors border border-[#e2e8f0]"
                  >
                    + External
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-semibold text-[#0f172a] mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-cu-blue" />
                Recent Sessions
              </h3>
              
              {isLoading ? (
                <div className="animate-pulse flex flex-col gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-[#f1f5f9] rounded-xl w-full"></div>
                  ))}
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-[#64748b]">
                  No sessions recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#e2e8f0]">
                        <th className="pb-3 font-semibold text-[#64748b] text-sm">Task</th>
                        <th className="pb-3 font-semibold text-[#64748b] text-sm">Date</th>
                        <th className="pb-3 font-semibold text-[#64748b] text-sm">Duration</th>
                        <th className="pb-3 font-semibold text-[#64748b] text-sm">Flow Score</th>
                        <th className="pb-3 font-semibold text-[#64748b] text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map(session => (
                        <tr key={session.id} className="border-b border-[#f1f5f9] last:border-0">
                          <td className="py-4 text-sm font-medium text-[#0f172a]">
                            {session.tasks?.title || 'Unassigned Task'}
                          </td>
                          <td className="py-4 text-sm text-[#64748b]">
                            {new Date(session.start_time).toLocaleDateString()}
                          </td>
                          <td className="py-4 text-sm text-[#0f172a] font-medium">
                            {formatTime(session.actual_duration_seconds)}
                          </td>
                          <td className="py-4">
                            {session.flow_score !== null ? (
                              <div className="flex items-center gap-1.5">
                                <Activity className="w-4 h-4 text-cu-green" />
                                <span className="text-sm font-bold text-[#0f172a]">{session.flow_score}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-[#94a3b8]">-</span>
                            )}
                          </td>
                          <td className="py-4">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
                              session.status === 'completed' ? 'bg-[#f0fdf4] text-cu-green' :
                              session.status === 'active' ? 'bg-[#f5f3ff] text-cu-purple' :
                              'bg-[#f1f5f9] text-[#64748b]'
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
