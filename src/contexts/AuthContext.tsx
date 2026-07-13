/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import * as Sentry from "@sentry/react";

interface Workspace {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
  setCurrentWorkspaceId: (id: string) => void;
  refreshWorkspaces: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const WORKSPACE_STORAGE_KEY = 'focus_current_workspace_id';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const hasInitialFetch = useRef(false);
  const [currentWorkspaceId, setCurrentWorkspaceIdState] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(WORKSPACE_STORAGE_KEY);
    }
    return null;
  });
  const setCurrentWorkspaceId = useCallback((id: string | null) => {
    setCurrentWorkspaceIdState(id);
    if (id) {
      localStorage.setItem(WORKSPACE_STORAGE_KEY, id);
    } else {
      localStorage.removeItem(WORKSPACE_STORAGE_KEY);
    }
  }, []);

  const fetchWorkspaces = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      setWorkspaces(data as Workspace[]);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    }
  }, []);

  const refreshWorkspaces = useCallback(async () => {
    if (user) {
      await fetchWorkspaces();
    }
  }, [user, fetchWorkspaces]);

  useEffect(() => {
    if (workspaces.length > 0) {
      const isValid = workspaces.some(w => w.id === currentWorkspaceId);
      if (!currentWorkspaceId || !isValid) {
        setCurrentWorkspaceId(workspaces[0].id);
      }
    }
  }, [workspaces, currentWorkspaceId, setCurrentWorkspaceId]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        Sentry.setUser(currentUser ? { id: currentUser.id, email: currentUser.email } : null);

        if (currentUser) {
          await fetchWorkspaces();
          hasInitialFetch.current = true;
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        if (!hasInitialFetch.current) {
          setSession(session);
          setUser(session.user);
          Sentry.setUser({ id: session.user.id, email: session.user.email ?? undefined });
          await fetchWorkspaces();
          hasInitialFetch.current = true;
        }
      } else if (event === "SIGNED_OUT") {
        setSession(null);
        setUser(null);
        Sentry.setUser(null);
        setWorkspaces([]);
        setCurrentWorkspaceId(null);
        hasInitialFetch.current = false;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchWorkspaces, setCurrentWorkspaceId]);

  const value = {
    session,
    user,
    isLoading,
    workspaces,
    currentWorkspaceId,
    setCurrentWorkspaceId,
    refreshWorkspaces,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
