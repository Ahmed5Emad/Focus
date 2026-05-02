import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { useFocus } from "../contexts/FocusContext";
import { Timer, Pause, Square, AlertCircle, X } from "lucide-react";

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
  const navigate = useNavigate();
  const { isActive, activeSession, secondsElapsed, stopSession, logDistraction } = useFocus();
  const [isDistractionModalOpen, setIsDistractionModalOpen] = useState(false);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        navigate('/tasks/new');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'd' && isActive) {
        e.preventDefault();
        setIsDistractionModalOpen(true);
      }
      if (e.key === 'Escape' && isDistractionModalOpen) {
        setIsDistractionModalOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [navigate, isActive, isDistractionModalOpen]);

  return (
    <div 
      className="flex items-start relative w-full h-screen overflow-hidden"
      style={{ 
        backgroundImage: "linear-gradient(90deg, rgb(248, 250, 252) 0%, rgb(248, 250, 252) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" 
      }}
    >
      <Sidebar />
      
      <div className="flex flex-col flex-1 h-full overflow-hidden relative">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto w-full relative">
          <div className="w-full px-[48px] pt-0 pb-6">
            <Outlet />
          </div>

          {isActive && (
            <div className="fixed bottom-8 left-[300px] right-[48px] z-50">
              <div className="backdrop-blur-md bg-[rgba(255,255,255,0.9)] border border-[#e2e8f0] drop-shadow-[0px_8px_15px_rgba(0,0,0,0.08)] flex h-16 items-center justify-between px-4.25 py-px rounded-3xl w-full">
                <div className="flex gap-4 items-center">
                  <div className="bg-[#f5f3ff] border border-[#ede9fe] flex items-center justify-center rounded-2xl w-10 h-10 shrink-0">
                    <Timer className="w-4.5 h-4.5 text-cu-purple" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-['Spline_Sans',sans-serif] font-bold text-cu-purple text-[10px] leading-4 tracking-[1px] uppercase">
                      ACTIVE FOCUS
                    </span>
                    <span className="font-['Spline_Sans',sans-serif] font-semibold text-[#0f172a] text-[14px] leading-5">
                      {activeSession?.tasks?.title || 'No Task Selected'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-6 items-center">
                  <span className="font-['Spline_Sans',sans-serif] font-bold text-[#0f172a] text-[18px] leading-6">
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
                      onClick={() => stopSession()}
                      className="bg-[#f1f5f9] hover:bg-[#e2e8f0] transition-colors border-none flex items-center justify-center rounded-xl w-8 h-8 cursor-pointer"
                    >
                      <Pause className="w-3.5 h-3.5 text-[#475569] fill-[#475569]" />
                    </button>
                    <button 
                      onClick={() => stopSession()}
                      className="bg-[#f1f5f9] hover:bg-[#e2e8f0] transition-colors border-none flex items-center justify-center rounded-xl w-8 h-8 cursor-pointer"
                    >
                      <Square className="w-3 h-3 text-[#475569] fill-[#475569]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {isDistractionModalOpen && isActive && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-xl border border-[#e2e8f0] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0]">
                  <h3 className="font-semibold text-[#0f172a] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-cu-orange" />
                    Log Distraction
                  </h3>
                  <button 
                    onClick={() => setIsDistractionModalOpen(false)}
                    className="text-[#64748b] hover:text-[#0f172a] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4 flex flex-col gap-4">
                  <p className="text-sm text-[#64748b]">
                    What kind of distraction was it? Logging helps calculate your flow score.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        logDistraction('internal', 'minor');
                        setIsDistractionModalOpen(false);
                      }}
                      className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#e2e8f0] hover:border-cu-blue hover:bg-[#f0f9ff] transition-all text-left gap-2"
                    >
                      <span className="font-semibold text-[#0f172a]">Internal</span>
                      <span className="text-xs text-[#64748b] text-center">Lost focus, daydreaming, urge to check phone</span>
                    </button>
                    <button
                      onClick={() => {
                        logDistraction('external', 'minor');
                        setIsDistractionModalOpen(false);
                      }}
                      className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#e2e8f0] hover:border-cu-orange hover:bg-[#fff7ed] transition-all text-left gap-2"
                    >
                      <span className="font-semibold text-[#0f172a]">External</span>
                      <span className="text-xs text-[#64748b] text-center">Notification, someone talking to you, noise</span>
                    </button>
                  </div>
                  
                  <div className="mt-2 pt-4 border-t border-[#e2e8f0]">
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
