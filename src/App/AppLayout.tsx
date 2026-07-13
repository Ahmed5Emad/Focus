import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { useFocus } from "../contexts/FocusContext";
import { Timer, Play, Pause, Square, AlertCircle, X } from "lucide-react";

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
  const { isActive, isPaused, activeSession, secondsElapsed, pauseSession, resumeSession, stopSession, logDistraction } = useFocus();
  const [isDistractionModalOpen, setIsDistractionModalOpen] = useState(false);

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
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isActive, isDistractionModalOpen]);

  return (
    <div 
      className="flex items-start relative w-full h-screen overflow-hidden bg-background"
    >
      <Sidebar />
      
      <div className="flex flex-col flex-1 h-full overflow-hidden relative">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto w-full relative">
          <div className="w-full h-full px-[48px] pt-0 pb-6 flex flex-col">
            <Outlet />
          </div>

          {isActive && (
            <div className="fixed bottom-8 left-4 right-4 lg:left-[300px] lg:right-[48px] z-50">
              <div className="backdrop-blur-md bg-white/90 border border-slate-200 drop-shadow-[0px_8px_15px_rgba(0,0,0,0.08)] flex h-16 items-center justify-between px-4.25 py-px rounded-3xl w-full">
                <div className="flex gap-4 items-center">
                  <div className="bg-[#f5f3ff] border border-[#ede9fe] flex items-center justify-center rounded-2xl w-10 h-10 shrink-0">
                    <Timer className="w-4.5 h-4.5 text-cu-purple" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-['Spline_Sans',sans-serif] font-bold text-cu-purple text-[10px] leading-4 tracking-[1px] uppercase">
                      ACTIVE FOCUS
                    </span>
                    <span className="font-['Spline_Sans',sans-serif] font-semibold text-slate-900 text-[14px] leading-5">
                      {activeSession?.task_id ? 'Focusing on task' : 'No Task Selected'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-6 items-center">
                  <span className="font-['Spline_Sans',sans-serif] font-bold text-slate-900 text-[18px] leading-6">
                    {formatTime(secondsElapsed)}
                  </span>
                  <div className="flex gap-2 items-center">
                    <button 
                      onClick={() => setIsDistractionModalOpen(true)}
                      className="bg-[#fff7ed] hover:bg-[#ffedd5] transition-colors border-none flex items-center justify-center rounded-xl px-3 h-8 cursor-pointer gap-1.5 mr-2"
                      title="Log Distraction (Cmd/Ctrl + D)"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-cu-orange" />
                      <span className="text-xs font-semibold text-cu-orange">Log</span>
                    </button>
                    <button 
                      onClick={() => isPaused ? resumeSession() : pauseSession()}
                      className="bg-slate-100 hover:bg-slate-200 transition-colors border-none flex items-center justify-center rounded-xl w-8 h-8 cursor-pointer"
                      title={isPaused ? "Resume" : "Pause"}
                    >
                      {isPaused ? (
                        <Play className="w-3.5 h-3.5 text-slate-600" />
                      ) : (
                        <Pause className="w-3.5 h-3.5 text-slate-600 fill-slate-600" />
                      )}
                    </button>
                    <button 
                      onClick={() => stopSession()}
                      className="bg-slate-100 hover:bg-slate-200 transition-colors border-none flex items-center justify-center rounded-xl w-8 h-8 cursor-pointer"
                    >
                      <Square className="w-3 h-3 text-slate-600 fill-slate-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {isDistractionModalOpen && isActive && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
              aria-labelledby="distraction-dialog-title"
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsDistractionModalOpen(false);
                if (e.key === 'Tab') {
                  const focusable = e.currentTarget.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                  );
                  const first = focusable[0];
                  const last = focusable[focusable.length - 1];
                  if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last?.focus();
                  } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first?.focus();
                  }
                }
              }}
            >
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                  <h3 id="distraction-dialog-title" className="font-semibold text-slate-900 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-cu-orange" />
                    Log Distraction
                  </h3>
                  <button
                    onClick={() => setIsDistractionModalOpen(false)}
                    className="text-slate-500 hover:text-slate-900 transition-colors"
                    aria-label="Close distraction dialog"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4 flex flex-col gap-4">
                  <p className="text-sm text-slate-500">
                    What kind of distraction was it? Logging helps calculate your flow score.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        logDistraction('internal', 'minor');
                        setIsDistractionModalOpen(false);
                      }}
                      className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-cu-blue hover:bg-[#f0f9ff] transition-all text-left gap-2"
                    >
                      <span className="font-semibold text-slate-900">Internal</span>
                      <span className="text-xs text-slate-500 text-center">Lost focus, daydreaming, urge to check phone</span>
                    </button>
                    <button
                      onClick={() => {
                        logDistraction('external', 'minor');
                        setIsDistractionModalOpen(false);
                      }}
                      className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-cu-orange hover:bg-[#fff7ed] transition-all text-left gap-2"
                    >
                      <span className="font-semibold text-slate-900">External</span>
                      <span className="text-xs text-slate-500 text-center">Notification, someone talking to you, noise</span>
                    </button>
                  </div>
                  
                  <div className="mt-2 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => {
                        logDistraction('external', 'major');
                        setIsDistractionModalOpen(false);
                      }}
                      className="w-full flex items-center justify-center p-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-semibold transition-colors text-sm"
                    >
                      Major Interruption (15+ mins)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
