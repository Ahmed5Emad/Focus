import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Timer, BellRing, Check, X, User, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CommandPalette } from "./CommandPalette";

function timeAgo(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

export function TopBar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [signingOut, setSigningOut] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
    } finally {
      setSigningOut(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full flex justify-center py-4 mt-2">
      <div className="w-full px-[48px]">
        <div className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-between px-6 py-2.5 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
          <button
            data-search-trigger
            onClick={() => setPaletteOpen(true)}
            className="flex items-center gap-3 bg-white/50 hover:bg-white/70 transition-all duration-300 px-6 py-2.5 rounded-full border border-white/40 text-slate-500 text-sm group cursor-pointer shadow-sm focus-within:ring-2 focus-within:ring-purple-500/30 hover:scale-[1.01] active:scale-[0.99] w-full max-w-[600px]"
          >
            <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            <span className="font-medium">Search anything...</span>
            <div className="flex items-center gap-1 ml-auto opacity-60 group-hover:opacity-100 transition-opacity">
              <kbd className="bg-white/80 border border-white/60 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-400 shadow-sm">⌘</kbd>
              <kbd className="bg-white/80 border border-white/60 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-400 shadow-sm">K</kbd>
            </div>
          </button>
          <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />

          <div className="flex items-center gap-[12px]">
            <button className="p-2 hover:bg-white/50 rounded-xl transition-colors text-slate-600 cursor-pointer group">
              <Timer className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
            <Popover open={notifOpen} onOpenChange={setNotifOpen}>
              <PopoverTrigger asChild>
                <button className="p-2 hover:bg-white/50 rounded-xl transition-colors text-slate-600 relative cursor-pointer group">
                  <BellRing className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold rounded-full px-1 shadow-sm border border-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" sideOffset={12} className="w-[380px] p-0 rounded-2xl border-slate-200/80 shadow-xl">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => { markAllAsRead(); }}
                      className="flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <BellRing className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="text-sm text-slate-500">No notifications</p>
                    </div>
                  ) : (
                    <div>
                      {notifications.map((notif) => (
                        <button
                          key={notif.id}
                          onClick={() => {
                            if (!notif.is_read) markAsRead(notif.id);
                            setNotifOpen(false);
                            if (notif.link) navigate(notif.link);
                          }}
                          className={`w-full text-left px-5 py-3.5 border-b border-slate-50 last:border-b-0 hover:bg-slate-50/80 transition-colors cursor-pointer group ${
                            !notif.is_read ? "bg-purple-50/40" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!notif.is_read ? "bg-purple-500" : "bg-transparent"}`} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${!notif.is_read ? "font-semibold text-slate-900" : "text-slate-700"}`}>
                                {notif.title}
                              </p>
                              {notif.body && (
                                <p className="text-xs text-slate-500 mt-0.5 truncate">
                                  {notif.body}
                                </p>
                              )}
                              <p className="text-[11px] text-slate-400 mt-1">
                                {timeAgo(notif.created_at)}
                              </p>
                            </div>
                            {!notif.is_read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notif.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 rounded-full cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5 text-slate-400" />
                              </button>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <div className="w-px h-5 bg-slate-200/50 mx-1" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-9 h-9 rounded-full border-2 border-white/60 overflow-hidden bg-white/50 hover:border-white hover:bg-white/80 transition-all shadow-sm flex items-center justify-center cursor-pointer group">
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-purple-100 text-purple-700 text-xs font-semibold">
                      {user?.email?.charAt(0).toUpperCase() ?? <User className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium truncate">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                >
                  <LogOut className="mr-2 size-4" />
                  <span>{signingOut ? "Signing out..." : "Sign out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
