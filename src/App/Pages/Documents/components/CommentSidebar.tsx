import { useState, useEffect, useRef, useCallback } from "react";
import type { Editor as TiptapEditor } from "@tiptap/react";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
}

interface Comment {
  id: string;
  document_id: string;
  user_id: string;
  content: string;
  selection_from: number | null;
  selection_to: number | null;
  created_at: string;
  profile?: Profile;
}

interface CommentSidebarProps {
  documentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editorRef?: React.MutableRefObject<TiptapEditor | null>;
}

export function CommentSidebar({ documentId, open, onOpenChange, editorRef }: CommentSidebarProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [highlightedComment, setHighlightedComment] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const profileCacheRef = useRef<Map<string, Profile>>(new Map());

  const getProfile = useCallback(async (userId: string): Promise<Profile> => {
    const cached = profileCacheRef.current.get(userId);
    if (cached) return cached;
    try {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", userId)
        .single();
      const profile = data ?? { display_name: null, avatar_url: null };
      profileCacheRef.current.set(userId, profile);
      return profile;
    } catch {
      return { display_name: null, avatar_url: null };
    }
  }, []);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("document_comments")
        .select("id, document_id, user_id, content, selection_from, selection_to, created_at")
        .eq("document_id", documentId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const commentList = data ?? [];
      const userIds = [...new Set(commentList.map((c) => c.user_id))];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", userIds);

      (profiles ?? []).forEach((p) => {
        profileCacheRef.current.set(p.id, { display_name: p.display_name, avatar_url: p.avatar_url });
      });

      const profileMap = new Map(profileCacheRef.current);
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
          const profile = await getProfile(msg.user_id);
          setComments((prev) => [...prev, { ...msg, profile }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [open, documentId, getProfile]);

  const handleSend = async () => {
    if (!newComment.trim() || !user) return;
    setSending(true);

    let selectionFrom: number | null = null;
    let selectionTo: number | null = null;
    if (editorRef?.current) {
      const { from, to } = editorRef.current.state.selection;
      if (from !== to) {
        selectionFrom = from;
        selectionTo = to;
      }
    }

    try {
      const { error } = await supabase.from("document_comments").insert({
        document_id: documentId,
        user_id: user.id,
        content: newComment.trim(),
        selection_from: selectionFrom,
        selection_to: selectionTo,
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

  const highlightTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleCommentClick = (comment: Comment) => {
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    setHighlightedComment(comment.id);
    if (comment.selection_from != null && editorRef?.current) {
      const { selection_from, selection_to } = comment;
      editorRef.current.commands.focus(selection_from);
      if (selection_to != null) {
        editorRef.current.commands.setTextSelection({
          from: selection_from,
          to: selection_to,
        });
      }
    }
    highlightTimerRef.current = setTimeout(() => setHighlightedComment(null), 2000);
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
    <div className="w-80 border-l border-sidebar-border bg-sidebar flex flex-col shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border">
        <h3 className="text-sm font-semibold text-sidebar-foreground flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          Comments
        </h3>
        <button
          onClick={() => onOpenChange(false)}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No comments yet
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              onClick={() => handleCommentClick(comment)}
              className={`flex gap-3 p-2 -mx-2 rounded-xl cursor-pointer transition-colors ${
                highlightedComment === comment.id
                  ? "bg-primary/10 ring-1 ring-primary/30"
                  : "hover:bg-accent/50"
              }`}
            >
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
                  <span className="text-sm font-semibold text-sidebar-foreground">
                    {comment.profile?.display_name ?? "Unknown"}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {formatTime(comment.created_at)}
                  </span>
                </div>
                {comment.selection_from != null && (
                  <span className="text-[11px] text-primary font-medium">
                    Anchored to text
                  </span>
                )}
                <div className="mt-1 px-3 py-2 bg-accent rounded-xl text-sm text-accent-foreground leading-relaxed">
                  {comment.content}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-sidebar-border px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={editorRef?.current?.state.selection.from !== editorRef?.current?.state.selection.to
              ? "Comment on selected text..."
              : "Add a comment..."
            }
            rows={2}
            className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-lg resize-none outline-none focus:border-ring focus:ring-1 focus:ring-ring/20 text-foreground placeholder:text-muted-foreground transition-colors"
          />
          <Button
            onClick={handleSend}
            disabled={!newComment.trim() || sending}
            size="icon"
            className="h-9 w-9 shrink-0 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground"
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
