import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null);
  const supabase = createClient();

  const fetchWorkspaces = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const fetchedWorkspaces = data as Workspace[];
      setWorkspaces(fetchedWorkspaces);
      
      if (fetchedWorkspaces.length > 0 && !currentWorkspaceId) {
        setCurrentWorkspaceId(fetchedWorkspaces[0].id);
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    }
  }, [supabase, currentWorkspaceId]);

  const refreshWorkspaces = useCallback(async () => {
    if (user) {
      await fetchWorkspaces();
    }
  }, [user, fetchWorkspaces]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await fetchWorkspaces();
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        await fetchWorkspaces();
      } else {
        setWorkspaces([]);
        setCurrentWorkspaceId(null);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchWorkspaces]);

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
