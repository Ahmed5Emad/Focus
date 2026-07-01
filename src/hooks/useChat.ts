import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ChatMessage {
  id: string;
  workspace_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function useChat() {
  const { user, currentWorkspaceId } = useAuth();
  const [supabase] = useState(() => createClient());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentWorkspaceId) {
      setIsLoading(false);
      return;
    }

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("workspace_id", currentWorkspaceId)
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;
        setMessages(data ? data.reverse() : []);
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
            setMessages((prev) => [...prev, payload.new as ChatMessage]);
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentWorkspaceId, supabase]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || !currentWorkspaceId || !user) return false;

    try {
      const { error } = await supabase.from("chat_messages").insert({
        workspace_id: currentWorkspaceId,
        user_id: user.id,
        content: content.trim(),
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  };

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
    sendMessage,
    editMessage,
    deleteMessage,
    clearMessages,
  };
}
