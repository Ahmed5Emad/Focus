import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { useFocus } from "../contexts/FocusContext";
import { Timer, Pause, Square } from "lucide-react";

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
  const { isActive, activeSession, secondsElapsed, stopSession } = useFocus();

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        navigate('/tasks/new');
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [navigate]);

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
        </main>
      </div>
    </div>
  );
}
