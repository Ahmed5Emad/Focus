import { useState } from "react";
import { MessageSquare, Send, Trash2, Loader2 } from "lucide-react";
import { useTaskComments } from "@/hooks/useTaskComments";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TaskCommentsProps {
  taskId: string;
}

export function TaskComments({ taskId }: TaskCommentsProps) {
  const { user } = useAuth();
  const { comments, isLoading, addComment, deleteComment } = useTaskComments(taskId);
  const [newComment, setNewComment] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!newComment.trim() || isSending) return;
    setIsSending(true);
    const ok = await addComment(newComment);
    setIsSending(false);
    if (ok) setNewComment("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a comment... (Enter to send, Shift+Enter for new line)"
          rows={2}
          className="flex-1 text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg resize-none outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition-all placeholder:text-slate-400"
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
