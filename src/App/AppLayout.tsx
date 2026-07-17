import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { PagePresence } from "./components/PagePresence";
import { KeyboardShortcutsModal } from "./components/KeyboardShortcutsModal";
import { useFocus } from "../contexts/FocusContext";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Timer, Play, Pause, Square, AlertCircle, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

const formatTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export function AppLayout() {
  const { user, isLoading, workspaces, refreshWorkspaces, setCurrentWorkspaceId } = useAuth();
  const { isActive, isPaused, activeSession, secondsElapsed, pauseSession, resumeSession, stopSession, logDistraction } = useFocus();
  const [isDistractionModalOpen, setIsDistractionModalOpen] = useState(false);
  const [isKeyboardShortcutsOpen, setIsKeyboardShortcutsOpen] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    const saved = localStorage.getItem('focus_sidebar_expanded');
    return saved !== null ? saved === 'true' : true;
  });

  const handleToggleSidebar = () => {
    setSidebarExpanded(prev => {
      const next = !prev;
      localStorage.setItem('focus_sidebar_expanded', String(next));
      return next;
    });
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector<HTMLButtonElement>('[data-search-trigger]')?.click();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'd' && isActive) {
        e.preventDefault();
        setIsDistractionModalOpen(true);
      }
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && e.shiftKey) {
        if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
          e.preventDefault();
          setIsKeyboardShortcutsOpen(prev => !prev);
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setIsKeyboardShortcutsOpen(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isActive, isDistractionModalOpen]);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceName.trim() || !user) return;
    setIsCreating(true);
    try {
      const { data, error } = await supabase.rpc('create_workspace', {
        p_name: workspaceName.trim(),
      });
      if (error) throw error;
      if (!data?.workspace_id) throw new Error('Failed to create workspace');
      await refreshWorkspaces();
      setCurrentWorkspaceId(data.workspace_id);
      toast.success('Workspace created');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create workspace');
    } finally {
      setIsCreating(false);
    }
  };

  const noWorkspace = !isLoading && user && workspaces.length === 0;

  return (
    <div 
      className="flex items-start relative w-full h-screen overflow-hidden bg-background"
    >
      {noWorkspace ? (
        <div className="flex items-center justify-center w-full h-full p-8">
          <div className="max-w-md w-full mx-auto text-center">
            <div className="w-16 h-16 bg-[#f5f3ff] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Timer className="w-8 h-8 text-[#8b5cf6]" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to Focus</h1>
            <p className="text-muted-foreground mb-8">Create your first workspace to get started.</p>
            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <Input
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="My Workspace"
                className="text-center"
                required
              />
              <Button type="submit" disabled={isCreating} className="w-full bg-primary hover:opacity-90 text-white">
                {isCreating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : 'Create Workspace'}
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:outline-none"
          >
            Skip to main content
          </a>
          <Sidebar expanded={sidebarExpanded} onToggle={handleToggleSidebar} mobileSheetOpen={mobileSheetOpen} setMobileSheetOpen={setMobileSheetOpen} />
          
          <div className="flex flex-col flex-1 h-full overflow-hidden relative">
            <TopBar onMenuClick={() => setMobileSheetOpen(true)} />
            
            <main id="main-content" className="flex-1 overflow-y-auto w-full relative">
              <div className="w-full h-full px-4 md:px-[48px] pt-0 pb-6 flex flex-col">
                <PagePresence />
                <Outlet />
              </div>

              {isActive && (
                <div className={cn(
                  "fixed bottom-4 md:bottom-8 z-50",
                  "left-4 right-4",
                  "lg:right-[48px]",
                  sidebarExpanded ? "lg:left-[300px]" : "lg:left-[120px]"
                )}>
                  <div className="backdrop-blur-md bg-card/90 border border-border drop-shadow-[0px_8px_15px_rgba(0,0,0,0.08)] flex flex-wrap items-center justify-between px-3 py-3 md:px-4.25 md:py-px md:h-16 rounded-2xl md:rounded-3xl w-full gap-2">
                    <div className="flex gap-2 md:gap-4 items-center min-w-0 flex-1 md:flex-auto">
                      <div className="bg-[#f5f3ff] border border-[#ede9fe] hidden sm:flex items-center justify-center rounded-2xl w-10 h-10 shrink-0">
                        <Timer className="w-4.5 h-4.5 text-cu-purple" />
                      </div>
                      <div className="flex flex-col items-start min-w-0">
                        <span className="font-['Spline_Sans',sans-serif] font-bold text-cu-purple text-[10px] leading-4 tracking-[1px] uppercase">ACTIVE FOCUS</span>
                        <span className="font-['Spline_Sans',sans-serif] font-semibold text-foreground text-[12px] md:text-[14px] leading-5 truncate max-w-[120px] sm:max-w-[200px]">
                          {activeSession?.task_id ? 'Focusing on task' : 'No Task Selected'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 md:gap-6 items-center ml-auto shrink-0">
                      <span className="font-['Spline_Sans',sans-serif] font-bold text-foreground text-[14px] md:text-[18px] leading-6">{formatTime(secondsElapsed)}</span>
                      <div className="flex gap-1.5 md:gap-2 items-center">
                        <button onClick={() => setIsDistractionModalOpen(true)} className="bg-[#fff7ed] hover:bg-[#ffedd5] transition-colors border-none flex items-center justify-center rounded-xl px-2 md:px-3 h-8 cursor-pointer gap-1" title="Log Distraction (Cmd/Ctrl + D)">
                          <AlertCircle className="w-3.5 h-3.5 text-cu-orange" />
                          <span className="text-xs font-semibold text-cu-orange hidden md:inline">Log</span>
                        </button>
                        <button onClick={() => isPaused ? resumeSession() : pauseSession()} className="bg-muted hover:bg-muted/80 transition-colors border-none flex items-center justify-center rounded-xl w-8 h-8 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" title={isPaused ? "Resume" : "Pause"} aria-label={isPaused ? "Resume focus session" : "Pause focus session"}>
                          {isPaused ? <Play className="w-3.5 h-3.5 text-muted-foreground" /> : <Pause className="w-3.5 h-3.5 text-muted-foreground fill-muted-foreground" />}
                        </button>
                        <button onClick={() => stopSession()} className="bg-muted hover:bg-muted/80 transition-colors border-none flex items-center justify-center rounded-xl w-8 h-8 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Stop focus session">
                          <Square className="w-3 h-3 text-muted-foreground fill-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {isDistractionModalOpen && isActive && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="distraction-dialog-title" onKeyDown={(e) => {
                  if (e.key === 'Escape') setIsDistractionModalOpen(false);
                  if (e.key === 'Tab') {
                    const focusable = e.currentTarget.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                    const first = focusable[0];
                    const last = focusable[focusable.length - 1];
                    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
                    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
                  }
                }}>
                  <div className="bg-card rounded-2xl shadow-xl border border-border w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between p-4 border-b border-border">
                      <h3 id="distraction-dialog-title" className="font-semibold text-foreground flex items-center gap-2"><AlertCircle className="w-4 h-4 text-cu-orange" /> Log Distraction</h3>
                      <button onClick={() => setIsDistractionModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Close distraction dialog"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="p-4 flex flex-col gap-4">
                      <p className="text-sm text-muted-foreground">What kind of distraction was it? Logging helps calculate your flow score.</p>
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => { logDistraction('internal', 'minor'); setIsDistractionModalOpen(false); }} className="flex flex-col items-center justify-center p-4 rounded-xl border border-border hover:border-cu-blue hover:bg-[#f0f9ff] transition-all text-left gap-2">
                          <span className="font-semibold text-foreground">Internal</span>
                          <span className="text-xs text-muted-foreground text-center">Lost focus, daydreaming, urge to check phone</span>
                        </button>
                        <button onClick={() => { logDistraction('external', 'minor'); setIsDistractionModalOpen(false); }} className="flex flex-col items-center justify-center p-4 rounded-xl border border-border hover:border-cu-orange hover:bg-[#fff7ed] transition-all text-left gap-2">
                          <span className="font-semibold text-foreground">External</span>
                          <span className="text-xs text-muted-foreground text-center">Notification, someone talking to you, noise</span>
                        </button>
                      </div>
                      <div className="mt-2 pt-4 border-t border-border">
                        <button onClick={() => { logDistraction('external', 'major'); setIsDistractionModalOpen(false); }} className="w-full flex items-center justify-center p-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-semibold transition-colors text-sm">Major Interruption (15+ mins)</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <KeyboardShortcutsModal open={isKeyboardShortcutsOpen} onOpenChange={setIsKeyboardShortcutsOpen} />
            </main>
          </div>
        </>
      )}
    </div>
  );
}
