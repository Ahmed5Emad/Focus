import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface FileAttachment {
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface ChatMessage {
  id: string;
  workspace_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  status: string;
  file_attachment: FileAttachment | null;
}

export function useChat() {
  const { user, currentWorkspaceId } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [typingUsers, setTypingUsers] = useState<{ userId: string; displayName: string }[]>([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const presenceChannelRef = useRef<ReturnType<ReturnType<typeof supabase.channel>['on']> | null>(null);
  const oldestMessageDateRef = useRef<string | null>(null);

  const markAsDelivered = useCallback(async (msgId: string) => {
    await supabase.from("chat_messages").update({ status: "delivered" }).eq("id", msgId).eq("status", "sent");
  }, []);

  const markAsRead = useCallback(async (msgId: string) => {
    await supabase.from("chat_messages").update({ status: "read" }).eq("id", msgId).neq("user_id", user?.id);
  }, [user]);

  useEffect(() => {
    if (!currentWorkspaceId || !user) {
      setIsLoading(false);
      return;
    }

    const fetchMessages = async () => {
      setIsLoading(true);
      setHasMore(true);
      oldestMessageDateRef.current = null;
      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("workspace_id", currentWorkspaceId)
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;
        const msgs = data ? data.reverse() : [];

        if (data && data.length > 0) {
          oldestMessageDateRef.current = data[data.length - 1].created_at;
        }
        setHasMore(data ? data.length >= 50 : false);

        const unreadIds = msgs
          .filter((m) => m.user_id !== user.id && m.status === "sent")
          .map((m) => m.id);
        if (unreadIds.length > 0) {
          await supabase.from("chat_messages").update({ status: "delivered" }).in("id", unreadIds);
          msgs.filter((m) => unreadIds.includes(m.id)).forEach((m) => (m.status = "delivered"));
        }

        setMessages(msgs);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel(`chat-hook-${currentWorkspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
          filter: `workspace_id=eq.${currentWorkspaceId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const msg = payload.new as ChatMessage;
            setMessages((prev) => [...prev, msg]);
            if (msg.user_id !== user.id) {
              markAsDelivered(msg.id);
            }
          } else if (payload.eventType === "UPDATE") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === payload.new.id
                  ? { ...m, ...(payload.new as ChatMessage) }
                  : m
              )
            );
          } else if (payload.eventType === "DELETE") {
            setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    const presenceChannel = supabase.channel(`chat-presence-${currentWorkspaceId}`);
    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const typing: { userId: string; displayName: string }[] = [];
        Object.values(state).forEach((presences) => {
          (presences as unknown as { userId: string; displayName: string; is_typing?: boolean }[]).forEach((p) => {
            if (p.userId !== user.id && p.is_typing !== false) {
              typing.push(p);
            }
          });
        });
        setTypingUsers(typing);
      })
      .subscribe();

    presenceChannelRef.current = presenceChannel;

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(presenceChannel);
    };
  }, [currentWorkspaceId, user, markAsDelivered]);

  const sendMessage = async (content: string, file?: FileAttachment) => {
    if ((!content.trim() && !file) || !currentWorkspaceId || !user) return false;

    try {
      const { error } = await supabase.from("chat_messages").insert({
        workspace_id: currentWorkspaceId,
        user_id: user.id,
        content: content.trim(),
        file_attachment: file ?? null,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  };

  const startTyping = useCallback(() => {
    if (!presenceChannelRef.current || !user) return;
    presenceChannelRef.current.track({ userId: user.id, displayName: user.email?.split("@")[0] ?? "User" });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      presenceChannelRef.current?.track({ userId: user.id, displayName: user.email?.split("@")[0] ?? "User", is_typing: false });
    }, 2000);
  }, [user]);

  const stopTyping = useCallback(() => {
    if (!presenceChannelRef.current || !user) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    presenceChannelRef.current.track({ userId: user.id, displayName: user.email?.split("@")[0] ?? "User", is_typing: false });
  }, [user]);

  const editMessage = async (messageId: string, newContent: string) => {
    if (!newContent.trim()) return false;

    try {
      const { error } = await supabase
        .from("chat_messages")
        .update({ content: newContent.trim(), updated_at: new Date().toISOString() })
        .eq("id", messageId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error editing message:", error);
      return false;
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from("chat_messages")
        .delete()
        .eq("id", messageId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting message:", error);
      return false;
    }
  };

  const loadMoreMessages = useCallback(async () => {
    if (!currentWorkspaceId || !user || !oldestMessageDateRef.current) return;

    setIsLoadingMore(true);
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("workspace_id", currentWorkspaceId)
        .lt("created_at", oldestMessageDateRef.current)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data && data.length > 0) {
        oldestMessageDateRef.current = data[data.length - 1].created_at;
      }
      setHasMore(data ? data.length >= 50 : false);

      const olderMsgs = data ? data.reverse() : [];
      setMessages((prev) => [...olderMsgs, ...prev]);
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentWorkspaceId, user]);

  const clearMessages = async () => {
    if (!currentWorkspaceId) return false;

    try {
      const { error } = await supabase
        .from("chat_messages")
        .delete()
        .eq("workspace_id", currentWorkspaceId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error clearing messages:", error);
      return false;
    }
  };

  return {
    messages,
    isLoading,
    isLoadingMore,
    hasMore,
    typingUsers,
    sendMessage,
    editMessage,
    deleteMessage,
    clearMessages,
    loadMoreMessages,
    startTyping,
    stopTyping,
    markAsRead,
  };
}
