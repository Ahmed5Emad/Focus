import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useTaskWatchers } from "@/hooks/useTaskWatchers";

interface TaskWatcherButtonProps {
  taskId: string;
}

export function TaskWatcherButton({ taskId }: TaskWatcherButtonProps) {
  const { isWatching, isLoading, toggleWatch } = useTaskWatchers(taskId);

  return (
    <button
      onClick={toggleWatch}
      disabled={isLoading}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={isWatching ? "Unwatch task" : "Watch task"}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isWatching ? (
        <EyeOff className="w-3.5 h-3.5" />
      ) : (
        <Eye className="w-3.5 h-3.5" />
      )}
      {isWatching ? "Watching" : "Watch"}
    </button>
  );
}
