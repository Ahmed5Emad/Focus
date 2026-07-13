import { useState } from "react";
import {
  CheckCircle,
  CheckCircle2,
  Timer,
  UserPlus,
  FolderPlus,
  Target,
  RefreshCw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ActivityLog } from "@/hooks/useActivityFeed";

const actionIcons: Record<string, { icon: typeof CheckCircle; bg: string; color: string }> = {
  task_created: { icon: CheckCircle, bg: "#eff6ff", color: "#3b82f6" },
  task_completed: { icon: CheckCircle2, bg: "#ecfdf5", color: "#10b981" },
  session_completed: { icon: Timer, bg: "#f5f3ff", color: "#8b5cf6" },
  member_joined: { icon: UserPlus, bg: "#fffbeb", color: "#f59e0b" },
  project_created: { icon: FolderPlus, bg: "#eef2ff", color: "#6366f1" },
  goal_created: { icon: Target, bg: "#fff1f2", color: "#e11d48" },
};

const actionLabels: Record<string, string> = {
  task_created: "created a task",
  task_completed: "completed a task",
  task_archived: "archived a task",
  session_completed: "completed a focus session",
  member_joined: "joined the workspace",
  project_created: "created a project",
  goal_created: "created a goal",
};

function getDefaultLabel(action: string): string {
  return actionLabels[action] ?? action.replace(/_/g, " ");
}

function relativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / 60000);
      return diffMinutes <= 1 ? "just now" : `${diffMinutes} min ago`;
    }
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDistanceToNow(date, { addSuffix: true });
}

interface ActivityFeedProps {
  activities: ActivityLog[];
  isLoading: boolean;
}

export default function ActivityFeed({ activities, isLoading }: ActivityFeedProps) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? activities : activities.slice(0, 20);

  if (isLoading) {
    return (
      <div className="space-y-4 px-6 pb-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <RefreshCw className="w-8 h-8 text-slate-300 mb-2" />
        <p className="text-sm font-medium text-slate-500">No recent activity</p>
      </div>
    );
  }

  return (
    <div>
      <div className="pb-2">
        {displayed.map((log, i) => {
          const logAction = actionIcons[log.action] ?? { icon: CheckCircle, bg: "#f1f5f9", color: "#94a3b8" };
          const Icon = logAction.icon;
          const displayName = log.profiles?.display_name ?? "Someone";

          return (
            <div
              key={log.id}
              className={`flex items-center gap-4 px-6 py-3.5 ${i > 0 ? "border-t border-slate-100" : ""}`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: logAction.bg, color: logAction.color }}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 truncate">
                  <span className="font-medium">{displayName}</span>{" "}
                  {getDefaultLabel(log.action)}
                  {!!log.metadata?.task_title && (
                    <span className="text-slate-500"> &ldquo;{String(log.metadata.task_title)}&rdquo;</span>
                  )}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {relativeTime(log.created_at)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {activities.length > 20 && !showAll && (
        <div className="px-6 pb-4 border-t border-slate-100">
          <button
            onClick={() => setShowAll(true)}
            className="w-full mt-3 py-2 text-xs font-semibold text-[#7c3aed] hover:bg-[#f5f3ff] rounded-lg transition-colors"
          >
            Show {activities.length - 20} more
          </button>
        </div>
      )}
    </div>
  );
}
