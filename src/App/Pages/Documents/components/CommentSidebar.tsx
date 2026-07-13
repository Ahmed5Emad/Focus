import { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Comment {
  id: string;
  document_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface CommentSidebarProps {
  documentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommentSidebar({ documentId, open, onOpenChange }: CommentSidebarProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("document_comments")
        .select("id, document_id, user_id, content, created_at")
        .eq("document_id", documentId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const commentList = data ?? [];
      const userIds = [...new Set(commentList.map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", userIds);

      const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
      setComments(
        commentList.map((c) => ({
          ...c,
          profile: profileMap.get(c.user_id) ?? { display_name: null, avatar_url: null },
        }))
      );
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (!open) return;
    fetchComments();
  }, [open, fetchComments]);

  useEffect(() => {
    if (!open || !documentId) return;

    const channel = supabase
      .channel(`document-comments-${documentId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "document_comments",
          filter: `document_id=eq.${documentId}`,
        },
        async (payload) => {
          const msg = payload.new as Comment;
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, avatar_url")
            .eq("id", msg.user_id)
            .single();
          setComments((prev) => [
            ...prev,
            { ...msg, profile: profile ?? { display_name: null, avatar_url: null } },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [open, documentId]);

  const handleSend = async () => {
    if (!newComment.trim() || !user) return;
    setSending(true);
    try {
      const { error } = await supabase.from("document_comments").insert({
        document_id: documentId,
        user_id: user.id,
        content: newComment.trim(),
      });
      if (error) throw error;
      setNewComment("");
    } catch (err) {
      console.error("Error sending comment:", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="w-80 border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] flex flex-col shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          Comments
        </h3>
        <button
          onClick={() => onOpenChange(false)}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">
            No comments yet
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="w-7 h-7 shrink-0 mt-0.5">
                <AvatarImage
                  src={comment.profile?.avatar_url ?? undefined}
                  alt={comment.profile?.display_name ?? "User"}
                />
                <AvatarFallback className="text-[10px]">
                  {(comment.profile?.display_name ?? "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {comment.profile?.display_name ?? "Unknown"}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    {formatTime(comment.created_at)}
                  </span>
                </div>
                <div className="mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {comment.content}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment..."
            rows={2}
            className="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg resize-none outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors"
          />
          <Button
            onClick={handleSend}
            disabled={!newComment.trim() || sending}
            size="icon"
            className="h-9 w-9 bg-primary hover:bg-[#6d28d9] text-white shrink-0 rounded-lg"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
