import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DirectMessage {
  id: string;
  workspace_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function useDirectMessages(otherUserId: string | null) {
  const { user, currentWorkspaceId } = useAuth();
  const [supabase] = useState(() => createClient());
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      setMessages(data ? data.reverse() : []);
    } catch (error) {
      console.error("Error fetching DMs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspaceId, user, otherUserId, supabase]);

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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentWorkspaceId, user, otherUserId, supabase]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || !currentWorkspaceId || !user || !otherUserId) return false;

    try {
      const { error } = await supabase.from("direct_messages").insert({
        workspace_id: currentWorkspaceId,
        sender_id: user.id,
        receiver_id: otherUserId,
        content: content.trim(),
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error sending DM:", error);
      return false;
    }
  };

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
    sendMessage,
    editMessage,
    deleteMessage,
    clearMessages,
  };
}
