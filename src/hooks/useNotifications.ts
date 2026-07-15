import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";

export interface Notification {
  id: string;
  user_id: string;
  workspace_id: string;
  type: "mention" | "assignment" | "comment" | "status_change" | "session_reminder" | "system";
  title: string;
  body?: string | null;
  link?: string | null;
  is_read: boolean;
  is_seen: boolean;
  created_at: string;
}

export function useNotifications() {
  const { user, currentWorkspaceId } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user || !currentWorkspaceId) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("workspace_id", currentWorkspaceId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications(data ?? []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, currentWorkspaceId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!user || !currentWorkspaceId) return;

    const channel = supabase
      .channel(`notifications-${user.id}-${currentWorkspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, currentWorkspaceId, fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);

      if (error) throw error;
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .in("id", unreadIds);

      if (error) throw error;
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }, [notifications]);

  const markAsSeen = useCallback(async (id: string) => {
    try {
      await supabase.from("notifications").update({ is_seen: true }).eq("id", id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_seen: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as seen:", error);
    }
  }, []);

  const markAllAsSeen = useCallback(async () => {
    const unseenIds = notifications.filter((n) => !n.is_seen).map((n) => n.id);
    if (unseenIds.length === 0) return;
    try {
      await supabase.from("notifications").update({ is_seen: true }).in("id", unseenIds);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_seen: true })));
    } catch (error) {
      console.error("Error marking all as seen:", error);
    }
  }, [notifications]);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const unseenCount = notifications.filter((n) => !n.is_seen).length;

  return {
    notifications,
    unreadCount,
    unseenCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    markAsSeen,
    markAllAsSeen,
    deleteNotification,
    refresh: fetchNotifications,
  };
}
