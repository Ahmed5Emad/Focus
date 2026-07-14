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
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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

  useEffect(() => {
    if (!scrollRef.current || comments.length === 0) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [comments.length]);

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

  const isOwnComment = (comment: Comment) => comment.user_id === user?.id;

  return (
    <div className="w-80 bg-white rounded-2xl border border-border flex flex-col shrink-0 max-h-[calc(100vh-200px)]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-cu-purple" />
          Comments
        </h3>
        <button
          onClick={() => onOpenChange(false)}
          className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            No comments yet
          </p>
        ) : (
          comments.map((comment) => {
            const isOwn = isOwnComment(comment);
            return (
              <div
                key={comment.id}
                onClick={() => handleCommentClick(comment)}
                className={`flex gap-2.5 cursor-pointer transition-all duration-150 ${
                  isOwn ? "flex-row-reverse" : ""
                } ${
                  highlightedComment === comment.id
                    ? "opacity-100"
                    : "opacity-90 hover:opacity-100"
                }`}
              >
                <Avatar className="mt-1 shrink-0 w-7 h-7">
                  <AvatarImage
                    src={comment.profile?.avatar_url ?? undefined}
                    alt={comment.profile?.display_name ?? "User"}
                  />
                  <AvatarFallback className="text-[10px]">
                    {(comment.profile?.display_name ?? "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className={`flex flex-col max-w-[80%] ${isOwn ? "items-end" : ""}`}>
                  <div className={`flex items-baseline gap-2 mb-0.5 ${isOwn ? "flex-row-reverse" : ""}`}>
                    <span className="text-xs font-semibold text-foreground">
                      {comment.profile?.display_name ?? "Unknown"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatTime(comment.created_at)}
                    </span>

                  </div>

                  <div
                    className={`px-3 py-2 text-sm leading-relaxed rounded-2xl ${
                      isOwn
                        ? "bg-cu-purple text-white"
                        : "bg-white border border-slate-100 shadow-sm text-slate-900"
                    } ${
                      highlightedComment === comment.id
                        ? isOwn
                          ? "ring-2 ring-cu-purple/60"
                          : "ring-2 ring-cu-purple/40"
                        : ""
                    }`}
                  >
                    {comment.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-border px-4 py-3">
        <div className="flex items-end gap-2 bg-[#f8f7fc] border border-border rounded-xl focus-within:border-cu-purple focus-within:ring-2 focus-within:ring-cu-purple/20 transition-all p-1.5">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={editorRef?.current?.state.selection.from !== editorRef?.current?.state.selection.to
              ? "Comment on selected text..."
              : "Add a comment..."
            }
            rows={1}
            className="flex-1 px-3 py-1.5 text-sm bg-transparent border-none resize-none outline-none text-foreground placeholder:text-muted-foreground"
          />
          <Button
            onClick={handleSend}
            disabled={!newComment.trim() || sending}
            size="icon"
            className="shrink-0 rounded-lg bg-cu-purple hover:bg-cu-purple/90 text-white h-8 w-8"
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
