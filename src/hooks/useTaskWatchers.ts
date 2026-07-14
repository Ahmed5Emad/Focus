import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";

export function useTaskWatchers(taskId: string | null) {
  const { user } = useAuth();
  const [watcherIds, setWatcherIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWatchers = useCallback(async () => {
    if (!taskId) return;
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from("task_watchers")
        .select("user_id")
        .eq("task_id", taskId);
      setWatcherIds((data ?? []).map((w) => w.user_id));
    } catch (error) {
      console.error("Error fetching watchers:", error);
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchWatchers();
  }, [fetchWatchers]);

  const isWatching = user ? watcherIds.includes(user.id) : false;

  const toggleWatch = async () => {
    if (!taskId || !user) return;
    try {
      if (isWatching) {
        const { error } = await supabase
          .from("task_watchers")
          .delete()
          .eq("task_id", taskId)
          .eq("user_id", user.id);
        if (error) throw error;
        setWatcherIds((prev) => prev.filter((id) => id !== user.id));
      } else {
        const { error } = await supabase
          .from("task_watchers")
          .insert({ task_id: taskId, user_id: user.id });
        if (error) throw error;
        setWatcherIds((prev) => [...prev, user.id]);
      }
    } catch (error) {
      console.error("Error toggling watch:", error);
    }
  };

  return { watcherIds, isWatching, isLoading, toggleWatch };
}
