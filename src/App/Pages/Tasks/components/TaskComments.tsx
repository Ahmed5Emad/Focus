import { useState, useRef, useEffect } from "react";
import { MessageSquare, Trash2, Loader2 } from "lucide-react";
import { useTaskComments } from "@/hooks/useTaskComments";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MentionInput } from "../../Chat/components/MentionInput";
import type { MemberProfile } from "../../Chat/components/MentionDropdown";
import { supabase } from "@/lib/supabase/client";

interface TaskCommentsProps {
  taskId: string;
}

let memberCache: MemberProfile[] = [];
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
          display_name: p?.display_name ?? emailMap.get(id)?.split("@")[0] ?? "Unknown",
          avatar_url: p?.avatar_url ?? null,
        };
      });
    } catch (e) {
      console.error("Failed to fetch members:", e);
    }
  })();
  return memberFetchPromise;
}

export function TaskComments({ taskId }: TaskCommentsProps) {
  const { user } = useAuth();
  const { comments, isLoading, addComment, deleteComment } = useTaskComments(taskId);
  const [newComment, setNewComment] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const sendingRef = useRef(false);

  useEffect(() => {
    if (!user) return;
    ensureMembers(user.user_metadata?.workspace_id ?? "").then(() => {
      setMembers([...memberCache]);
    });
  }, [user]);

  const handleSend = async () => {
    if (!newComment.trim() || isSending || sendingRef.current) return;
    sendingRef.current = true;
    setIsSending(true);
    const ok = await addComment(newComment);
    setIsSending(false);
    sendingRef.current = false;
    if (ok) setNewComment("");
  };

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <MessageSquare className="w-3.5 h-3.5" />
        Comments ({comments.length})
      </h4>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="w-6 h-6 shrink-0 mt-0.5">
                <AvatarImage src={comment.profiles?.avatar_url ?? undefined} />
                <AvatarFallback className="text-[8px]">
                  {(comment.profiles?.display_name ?? "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">
                    {comment.profiles?.display_name ?? "Unknown"}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                  {comment.user_id === user?.id && (
                    <button
                      onClick={() => deleteComment(comment.id)}
                      className="ml-auto p-1 text-slate-300 hover:text-red-500 rounded transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label="Delete comment"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-600 mt-0.5 whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 py-2">No comments yet.</p>
      )}

      <div className="flex items-end gap-2 pt-2 border-t border-slate-100">
        <MentionInput
          members={members}
          value={newComment}
          onChange={setNewComment}
          onSend={handleSend}
          placeholder="Add a comment... (@ to mention)"
        />
        <button
          onClick={handleSend}
          disabled={!newComment.trim() || isSending}
          className="p-2 bg-[#7c3aed] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Send comment"
        >
          {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function Send({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
