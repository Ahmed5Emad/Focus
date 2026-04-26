import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";

export function AppLayout() {
  const navigate = useNavigate();

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
        
        <main className="flex-1 overflow-y-auto w-full">
          <div className="w-full px-[48px] pt-0 pb-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
