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

interface MemberItem {
  id: string;
  label: string;
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

let memberCache: MemberItem[] = [];
let memberFetchPromise: Promise<void> | null = null;

async function ensureMembers(workspaceId: string) {
  if (memberCache.length > 0) return;
  if (memberFetchPromise) return memberFetchPromise;
  memberFetchPromise = (async () => {
    try {
      const { data: memberRows } = await supabase
        .rpc("get_workspace_members_with_email", { p_workspace_id: workspaceId });
      const rows = (memberRows ?? []) as Array<{ user_id: string; email: string }>;
      const userIds = rows.map((r) => r.user_id);
      const emailMap = new Map(rows.map((r) => [r.user_id, r.email]));
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", userIds);
      const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
      memberCache = userIds.map((id) => {
        const p = profileMap.get(id);
        return {
          id,
          label: p?.display_name ?? emailMap.get(id)?.split("@")[0] ?? "Unknown",
          avatar_url: p?.avatar_url ?? null,
        };
      });
    } catch (e) {
      console.error("Failed to fetch members:", e);
    }
  })();
  return memberFetchPromise;
}

function renderCommentContent(content: string) {
  const parts = content.split(/(@\S+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("@")) {
      return (
        <span key={i} className="text-cu-purple font-medium">{part}</span>
      );
    }
    return part;
  });
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionSelectedIndex, setMentionSelectedIndex] = useState(0);
  const mentionTriggerPos = useRef<number | null>(null);
  const mentionFiltered = memberCache.filter((m) =>
    m.label.toLowerCase().includes(mentionSearch.toLowerCase())
  ).slice(0, 8);

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
    if (user) {
      ensureMembers(user.user_metadata?.workspace_id ?? "");
    }
  }, [open, fetchComments, user]);

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

  const insertMention = useCallback((item: MemberItem) => {
    if (mentionTriggerPos.current === null) return;
    const before = newComment.slice(0, mentionTriggerPos.current);
    const after = newComment.slice(
      mentionTriggerPos.current + 1 + mentionSearch.length
    );
    setNewComment(before + "@" + item.label + " " + after);
    setMentionOpen(false);
    setMentionSearch("");
    mentionTriggerPos.current = null;
    textareaRef.current?.focus();
  }, [newComment, mentionSearch]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const cursor = e.target.selectionStart;
    setNewComment(val);

    const lastAtIndex = val.lastIndexOf("@", cursor - 1);
    if (lastAtIndex !== -1) {
      const textBeforeAt = val[lastAtIndex - 1];
      if (lastAtIndex === 0 || textBeforeAt === " " || textBeforeAt === "\n") {
        const searchText = val.slice(lastAtIndex + 1, cursor);
        if (searchText.length <= 30 && !searchText.includes(" ") && !searchText.includes("\n")) {
          mentionTriggerPos.current = lastAtIndex;
          setMentionSearch(searchText);
          setMentionSelectedIndex(0);
          setMentionOpen(true);
          return;
        }
      }
    }
    setMentionOpen(false);
    setMentionSearch("");
    mentionTriggerPos.current = null;
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (mentionOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionSelectedIndex((i) => Math.min(i + 1, mentionFiltered.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionSelectedIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter" && mentionFiltered[mentionSelectedIndex]) {
        e.preventDefault();
        insertMention(mentionFiltered[mentionSelectedIndex]);
        return;
      }
      if (e.key === "Escape") {
        setMentionOpen(false);
        setMentionSearch("");
        mentionTriggerPos.current = null;
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
                    {renderCommentContent(comment.content)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-border px-4 py-3 relative" ref={inputContainerRef}>
        {mentionOpen && mentionFiltered.length > 0 && (
          <div className="absolute bottom-full left-4 right-4 mb-1 bg-white rounded-xl border border-border shadow-lg overflow-hidden z-50">
            {mentionFiltered.map((item, i) => (
              <button
                key={item.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertMention(item);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors ${
                  i === mentionSelectedIndex
                    ? "bg-cu-purple/10 text-cu-purple"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                <Avatar className="w-5 h-5">
                  <AvatarImage src={item.avatar_url ?? undefined} />
                  <AvatarFallback className="text-[8px]">
                    {item.label.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2 bg-[#f8f7fc] border border-border rounded-xl focus-within:border-cu-purple focus-within:ring-2 focus-within:ring-cu-purple/20 transition-all p-1.5">
          <textarea
            ref={textareaRef}
            value={newComment}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={editorRef?.current?.state.selection.from !== editorRef?.current?.state.selection.to
              ? "Comment on selected text... (@ to mention)"
              : "Add a comment... (@ to mention)"
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
