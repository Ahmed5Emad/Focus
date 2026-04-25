import { Search, Timer, Bell, User } from "lucide-react";

export function TopBar() {
  return (
    <header className="sticky top-0 z-50 w-full flex justify-center py-4 mt-2">
      <div className="w-full max-w-[1280px] px-6">
        <div className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-between px-6 py-2.5 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
          <button className="flex items-center gap-3 bg-white/50 hover:bg-white/70 transition-all duration-300 px-6 py-2.5 rounded-full border border-white/40 text-slate-500 text-sm group cursor-pointer shadow-sm focus-within:ring-2 focus-within:ring-purple-500/30 hover:scale-[1.01] active:scale-[0.99] w-full max-w-[600px]">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            <span className="font-medium">Command Palette</span>
            <div className="flex items-center gap-1 ml-auto opacity-60 group-hover:opacity-100 transition-opacity">
              <kbd className="bg-white/80 border border-white/60 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-400 shadow-sm">⌘</kbd>
              <kbd className="bg-white/80 border border-white/60 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-400 shadow-sm">K</kbd>
            </div>
          </button>

          <div className="flex items-center gap-[12px]">
            <button className="p-2 hover:bg-white/50 rounded-xl transition-colors text-slate-600 cursor-pointer group">
              <Timer className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
            <button className="p-2 hover:bg-white/50 rounded-xl transition-colors text-slate-600 relative cursor-pointer group">
              <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 border border-white rounded-full shadow-sm" />
            </button>
            
            <div className="w-px h-5 bg-slate-200/50 mx-1" />
            
            <button className="w-9 h-9 rounded-full border-2 border-white/60 overflow-hidden bg-white/50 hover:border-white hover:bg-white/80 transition-all shadow-sm flex items-center justify-center cursor-pointer group">
              <User className="w-5 h-5 text-slate-600 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
