import { useLocation } from "react-router-dom";
import { usePresence } from "@/hooks/usePresence";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function PagePresence() {
  const location = useLocation();
  const { onlineUsers, userCount } = usePresence(location.pathname);

  if (userCount === 0) return null;

  const maxVisible = 3;
  const visibleUsers = onlineUsers.slice(0, maxVisible);
  const remaining = userCount - maxVisible;

  return (
    <div className="flex items-center -space-x-1.5">
      {visibleUsers.map((u) => (
        <Avatar key={u.userId} className="w-5 h-5 ring-1 ring-background">
          <AvatarFallback className="bg-purple-100 text-purple-700 text-[8px] font-semibold">
            {u.displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ))}
      {remaining > 0 && (
        <div className="flex w-5 h-5 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-[9px] font-semibold text-slate-500 dark:text-slate-400 ring-1 ring-background">
          +{remaining}
        </div>
      )}
    </div>
  );
}
