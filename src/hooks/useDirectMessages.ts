import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface FileAttachment {
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface DirectMessage {
  id: string;
  workspace_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  status: string;
  file_attachment: FileAttachment | null;
}

export function useDirectMessages(otherUserId: string | null) {
  const { user, currentWorkspaceId } = useAuth();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{ userId: string; displayName: string }[]>([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const presenceChannelRef = useRef<ReturnType<ReturnType<typeof supabase.channel>['on']> | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!currentWorkspaceId || !user || !otherUserId) {
      setMessages([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("direct_messages")
        .select("*")
        .eq("workspace_id", currentWorkspaceId)
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      const msgs = data ? data.reverse() : [];

      const unreadIds = msgs
        .filter((m) => m.sender_id !== user.id && m.status === "sent")
        .map((m) => m.id);
      if (unreadIds.length > 0) {
        await supabase.from("direct_messages").update({ status: "delivered" }).in("id", unreadIds);
        msgs.filter((m) => unreadIds.includes(m.id)).forEach((m) => (m.status = "delivered"));
      }

      setMessages(msgs);
    } catch (error) {
      console.error("Error fetching DMs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspaceId, user, otherUserId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!currentWorkspaceId || !user || !otherUserId) return;

    const channel = supabase
      .channel(`dm-${currentWorkspaceId}-${otherUserId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "direct_messages",
          filter: `workspace_id=eq.${currentWorkspaceId}`,
        },
        (payload) => {
          const msg = payload.new as DirectMessage | null;
          const old = payload.old as DirectMessage | null;

          const involvesConversation = (m: DirectMessage) =>
            (m.sender_id === user.id && m.receiver_id === otherUserId) ||
            (m.sender_id === otherUserId && m.receiver_id === user.id);

          if (payload.eventType === "INSERT" && msg && involvesConversation(msg)) {
            setMessages((prev) => [...prev, msg]);
            if (msg.sender_id !== user.id) {
              supabase.from("direct_messages").update({ status: "delivered" }).eq("id", msg.id);
            }
          } else if (payload.eventType === "UPDATE" && msg && involvesConversation(msg)) {
            setMessages((prev) =>
              prev.map((m) => (m.id === msg.id ? { ...m, ...msg } : m))
            );
          } else if (payload.eventType === "DELETE" && old) {
            setMessages((prev) => prev.filter((m) => m.id !== old.id));
          }
        }
      )
      .subscribe();

    const presenceChannel = supabase.channel(`dm-presence-${currentWorkspaceId}`);
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
  }, [currentWorkspaceId, user, otherUserId]);

  const sendMessage = async (content: string, file?: FileAttachment) => {
    if ((!content.trim() && !file) || !currentWorkspaceId || !user || !otherUserId) return false;

    try {
      const { error } = await supabase.from("direct_messages").insert({
        workspace_id: currentWorkspaceId,
        sender_id: user.id,
        receiver_id: otherUserId,
        content: content.trim(),
        file_attachment: file ?? null,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error sending DM:", error);
      return false;
    }
  };

  const startTyping = useCallback(() => {
    if (!presenceChannelRef.current || !user || !otherUserId) return;
    presenceChannelRef.current.track({ userId: user.id, displayName: user.email?.split("@")[0] ?? "User" });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      presenceChannelRef.current?.track({ userId: user.id, displayName: user.email?.split("@")[0] ?? "User", is_typing: false });
    }, 2000);
  }, [user, otherUserId]);

  const stopTyping = useCallback(() => {
    if (!presenceChannelRef.current || !user) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    presenceChannelRef.current.track({ userId: user.id, displayName: user.email?.split("@")[0] ?? "User", is_typing: false });
  }, [user]);

  const editMessage = async (messageId: string, newContent: string) => {
    if (!newContent.trim()) return false;

    try {
      const { error } = await supabase
        .from("direct_messages")
        .update({ content: newContent.trim(), updated_at: new Date().toISOString() })
        .eq("id", messageId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error editing DM:", error);
      return false;
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from("direct_messages")
        .delete()
        .eq("id", messageId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting DM:", error);
      return false;
    }
  };

  const clearMessages = async () => {
    if (!currentWorkspaceId || !otherUserId || !user) return false;

    try {
      const { error } = await supabase
        .from("direct_messages")
        .delete()
        .eq("workspace_id", currentWorkspaceId)
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
        );

      if (error) throw error;
      setMessages([]);
      return true;
    } catch (error) {
      console.error("Error clearing DMs:", error);
      return false;
    }
  };

  return {
    messages,
    isLoading,
    typingUsers,
    sendMessage,
    editMessage,
    deleteMessage,
    clearMessages,
    startTyping,
    stopTyping,
  };
}
