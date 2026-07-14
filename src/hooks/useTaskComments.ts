import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: { display_name: string | null; avatar_url: string | null };
}

export function useTaskComments(taskId: string | null) {
  const { user } = useAuth();
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!taskId) return;
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from("task_comments")
        .select("*, profiles!task_comments_user_id_fkey(display_name, avatar_url)")
        .eq("task_id", taskId)
        .order("created_at", { ascending: true });
      setComments(data ?? []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (content: string) => {
    if (!taskId || !user || !content.trim()) return false;
    try {
      const { error } = await supabase.from("task_comments").insert({
        task_id: taskId,
        user_id: user.id,
        content: content.trim(),
      });
      if (error) throw error;
      await fetchComments();
      return true;
    } catch (error) {
      console.error("Error adding comment:", error);
      return false;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("task_comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user?.id);
      if (error) throw error;
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      return true;
    } catch (error) {
      console.error("Error deleting comment:", error);
      return false;
    }
  };

  return { comments, isLoading, addComment, deleteComment, refresh: fetchComments };
}
