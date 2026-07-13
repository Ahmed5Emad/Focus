import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";

export interface ActivityLog {
  id: string;
  workspace_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  profiles?: { display_name: string | null; avatar_url: string | null };
}

export function useActivityFeed() {
  const { currentWorkspaceId } = useAuth();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    if (!currentWorkspaceId) return;
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from("activity_logs")
        .select("*, profiles!activity_logs_user_id_fkey(display_name, avatar_url)")
        .eq("workspace_id", currentWorkspaceId)
        .order("created_at", { ascending: false })
        .limit(50);
      setActivities(data ?? []);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspaceId]);

  useEffect(() => {
    if (!currentWorkspaceId) return;
    fetchActivities();
    const channelName = `activity-${currentWorkspaceId}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activity_logs",
          filter: `workspace_id=eq.${currentWorkspaceId}`,
        },
        () => {
          fetchActivities();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentWorkspaceId, fetchActivities]);

  return { activities, isLoading, fetchActivities };
}
