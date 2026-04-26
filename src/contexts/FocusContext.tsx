import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './AuthContext';
import { calculateFlowScore } from '@/lib/analytics';

export interface FocusSession {
  id: string;
  workspace_id: string;
  user_id: string;
  task_id: string | null;
  start_time: string;
  end_time: string | null;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  heartbeat_at: string;
  flow_score: number | null;
  actual_duration_seconds: number;
  tasks?: {
    title: string;
  };
}

export interface DistractionLog {
  id: string;
  session_id: string;
  type: 'internal' | 'external';
  severity: 'minor' | 'major';
  timestamp: string;
}

interface FocusContextType {
  activeSession: FocusSession | null;
  isActive: boolean;
  secondsElapsed: number;
  startSession: (taskId: string | null, workspaceId: string) => Promise<void>;
  stopSession: () => Promise<void>;
  logDistraction: (type: 'internal' | 'external', severity: 'minor' | 'major') => Promise<void>;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export function FocusProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [supabase] = useState(() => createClient());
  
  const timerRef = useRef<any>(null);
  const heartbeatRef = useRef<any>(null);

  const fetchActiveSession = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('focus_sessions')
      .select('*, tasks(title)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching active session:', error);
      return;
    }

    if (data) {
      const session = data as FocusSession;
      setActiveSession(session);
      
      const startTime = new Date(session.start_time).getTime();
      const now = new Date().getTime();
      setSecondsElapsed(Math.floor((now - startTime) / 1000));
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchActiveSession();
  }, [fetchActiveSession]);

  useEffect(() => {
    if (activeSession && activeSession.status === 'active') {
      timerRef.current = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setSecondsElapsed(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSession]);

  useEffect(() => {
    if (activeSession && activeSession.status === 'active') {
      heartbeatRef.current = setInterval(async () => {
        await supabase
          .from('focus_sessions')
          .update({ heartbeat_at: new Date().toISOString() })
          .eq('id', activeSession.id);
      }, 60000);
    } else {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    }

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [activeSession, supabase]);

  const startSession = async (taskId: string | null, workspaceId: string) => {
    if (!user) return;

    if (activeSession) {
      await stopSession();
    }

    const { data, error } = await supabase
      .from('focus_sessions')
      .insert({
        user_id: user.id,
        workspace_id: workspaceId,
        task_id: taskId,
        status: 'active',
        start_time: new Date().toISOString(),
        heartbeat_at: new Date().toISOString(),
        actual_duration_seconds: 0
      })
      .select('*, tasks(title)')
      .single();

    if (error) {
      console.error('Error starting session:', error);
      return;
    }

    setActiveSession(data as FocusSession);
    setSecondsElapsed(0);
  };

  const stopSession = async () => {
    if (!activeSession) return;

    const { data: distractions, error: distError } = await supabase
      .from('distraction_logs')
      .select('*')
      .eq('session_id', activeSession.id);

    if (distError) {
      console.error('Error fetching distractions:', distError);
    }

    const minorDistractions = distractions?.filter(d => d.severity === 'minor').length || 0;
    const majorDistractions = distractions?.filter(d => d.severity === 'major').length || 0;
    
    const flowScore = calculateFlowScore(secondsElapsed, minorDistractions, majorDistractions);

    const { error } = await supabase
      .from('focus_sessions')
      .update({
        status: 'completed',
        end_time: new Date().toISOString(),
        flow_score: flowScore,
        actual_duration_seconds: secondsElapsed
      })
      .eq('id', activeSession.id);

    if (error) {
      console.error('Error stopping session:', error);
      return;
    }

    setActiveSession(null);
    setSecondsElapsed(0);
  };

  const logDistraction = async (type: 'internal' | 'external', severity: 'minor' | 'major') => {
    if (!activeSession) return;

    const { error } = await supabase
      .from('distraction_logs')
      .insert({
        session_id: activeSession.id,
        type,
        severity,
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.error('Error logging distraction:', error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isDistractionShortcut = (e.metaKey || e.ctrlKey) && e.key === 'd';
      if (isDistractionShortcut) {
        e.preventDefault();
        if (activeSession) {
          logDistraction('external', 'minor');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSession]);


  const value = {
    activeSession,
    isActive: !!activeSession,
    secondsElapsed,
    startSession,
    stopSession,
    logDistraction,
  };

  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
}

export function useFocus() {
  const context = useContext(FocusContext);
  if (context === undefined) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
}
