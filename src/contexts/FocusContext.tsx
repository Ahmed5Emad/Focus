/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
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
  isPaused: boolean;
  secondsElapsed: number;
  startSession: (taskId: string | null, workspaceId: string) => Promise<void>;
  pauseSession: () => Promise<void>;
  resumeSession: () => Promise<void>;
  stopSession: () => Promise<void>;
  logDistraction: (type: 'internal' | 'external', severity: 'minor' | 'major') => Promise<void>;
  deleteSession: (sessionId: string) => Promise<boolean>;
  updateSession: (sessionId: string, updates: Partial<{ task_id: string | null; status: string; actual_duration_seconds: number; flow_score: number | null }>) => Promise<boolean>;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export function FocusProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchActiveSession = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['active', 'paused'])
      .order('start_time', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching active session:', error);
      return;
    }

    if (data) {
      const session = data as FocusSession;
      setActiveSession(session);
      
      if (session.status === 'paused') {
        setIsPaused(true);
        setSecondsElapsed(session.actual_duration_seconds || 0);
      } else {
        setIsPaused(false);
        const startTime = new Date(session.start_time).getTime();
        const now = new Date().getTime();
        setSecondsElapsed(Math.floor((now - startTime) / 1000));
      }
    }
  }, [user]);

  useEffect(() => {
    fetchActiveSession();
  }, [fetchActiveSession]);

  useEffect(() => {
    if (activeSession && activeSession.status === 'active' && !isPaused) {
      timerRef.current = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (!activeSession) setSecondsElapsed(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSession, isPaused]);

  useEffect(() => {
    if (activeSession && activeSession.status === 'active') {
      const sessionId = activeSession.id;
      heartbeatRef.current = setInterval(async () => {
        await supabase
          .from('focus_sessions')
          .update({ heartbeat_at: new Date().toISOString() })
          .eq('id', sessionId);
      }, 60000);
    }

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    };
  }, [activeSession]);

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
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Error starting session:', error);
      return;
    }

    setActiveSession(data as FocusSession);
    setSecondsElapsed(0);
  };

  const pauseSession = async () => {
    if (!activeSession || activeSession.status !== 'active') return;

    const { error } = await supabase
      .from('focus_sessions')
      .update({ 
        status: 'paused',
        actual_duration_seconds: secondsElapsed
      })
      .eq('id', activeSession.id);

    if (error) {
      console.error('Error pausing session:', error);
      return;
    }

    setActiveSession(prev => prev ? { ...prev, status: 'paused' } : null);
    setIsPaused(true);
  };

  const resumeSession = async () => {
    if (!activeSession || activeSession.status !== 'paused') return;

    const elapsed = secondsElapsed;
    const { error } = await supabase
      .from('focus_sessions')
      .update({ 
        status: 'active', 
        heartbeat_at: new Date().toISOString(),
        actual_duration_seconds: elapsed,
      })
      .eq('id', activeSession.id);

    if (error) {
      console.error('Error resuming session:', error);
      return;
    }

    setActiveSession(prev => prev ? { ...prev, status: 'active' } : null);
    setIsPaused(false);
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
    setIsPaused(false);
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

  const deleteSession = async (sessionId: string) => {
    try {
      const { error: logsError } = await supabase
        .from('distraction_logs')
        .delete()
        .eq('session_id', sessionId);

      if (logsError) throw logsError;

      const { error } = await supabase
        .from('focus_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      if (activeSession?.id === sessionId) {
        setActiveSession(null);
        setIsPaused(false);
        setSecondsElapsed(0);
      }

      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  };

  const updateSession = async (sessionId: string, updates: Partial<{ task_id: string | null; status: string; actual_duration_seconds: number; flow_score: number | null }>) => {
    try {
      const { error } = await supabase
        .from('focus_sessions')
        .update(updates)
        .eq('id', sessionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating session:', error);
      return false;
    }
  };

  const value = {
    activeSession,
    isActive: !!activeSession,
    isPaused,
    secondsElapsed,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    logDistraction,
    deleteSession,
    updateSession,
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
