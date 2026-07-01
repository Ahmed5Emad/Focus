import { useEffect, useRef, useState, useMemo } from "react";
import {
  MessageCircle,
  Hash,
  Send,
  Trash2,
  MoreHorizontal,
  Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/hooks/useChat";
import { useDirectMessages, type DirectMessage } from "@/hooks/useDirectMessages";
import type { ChatMessage as ChatMessageType } from "@/hooks/useChat";
import { ChatMessage } from "./components/ChatMessage";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MemberProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  email?: string;
}

interface RpcMemberRow {
  member_id: string;
  user_id: string;
  email: string;
  role: string;
  joined_at: string;
}

type ChatMode = "channel" | "dm";

export default function Chat() {
  const { user, currentWorkspaceId, workspaces } = useAuth();
  const [supabase] = useState(() => createClient());

  const [mode, setMode] = useState<ChatMode>("channel");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const groupChat = useChat();
  const dmChat = useDirectMessages(
    mode === "dm" ? selectedUserId : null
  );

  const bottomRef = useRef<HTMLDivElement>(null);

  const currentWorkspace = workspaces.find(
    (w) => w.id === currentWorkspaceId
  );

  useEffect(() => {
    if (!currentWorkspaceId) return;

    const fetchMembers = async () => {
      setMembersLoading(true);
      try {
        const { data: memberRows } = await supabase
          .rpc("get_workspace_members_with_email", {
            p_workspace_id: currentWorkspaceId,
          });

        if (!memberRows || memberRows.length === 0) {
          setMembers([]);
          return;
        }

        const rows = memberRows as RpcMemberRow[];
        const userIds = rows.map((r) => r.user_id);
        const emailMap = new Map<string, string>();
        rows.forEach((r) => emailMap.set(r.user_id, r.email));

        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .in("id", userIds);

        const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

        const merged: MemberProfile[] = userIds
          .map((id) => {
            const p = profileMap.get(id);
            return {
              id,
              display_name: p?.display_name ?? (emailMap.get(id)?.split('@')[0] ?? null),
              avatar_url: p?.avatar_url ?? null,
              email: emailMap.get(id),
            };
          });

        setMembers(merged);
      } catch (error) {
        console.error("Error fetching workspace members:", error);
        setMembers([]);
      } finally {
        setMembersLoading(false);
      }
    };

    fetchMembers();

    const checkAdmin = async () => {
      if (!currentWorkspaceId || !user) return;
      const { data } = await supabase
        .from("workspace_members")
        .select("role")
        .eq("workspace_id", currentWorkspaceId)
        .eq("user_id", user.id)
        .maybeSingle();
      setIsAdmin(data?.role === "admin");
    };
    checkAdmin();
  }, [currentWorkspaceId, supabase, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [groupChat.messages, dmChat.messages]);

  const active = mode === "channel" ? groupChat : dmChat;
  const selectedMember = useMemo(
    () => members.find((m) => m.id === selectedUserId),
    [members, selectedUserId]
  );

  const headerTitle =
    mode === "channel"
      ? "# general"
      : `@ ${selectedMember?.display_name ?? "Unknown"}`;

  const headerDescription =
    mode === "channel"
      ? `Workspace-wide chat for ${currentWorkspace?.name ?? "your team"}`
      : `Direct message with ${selectedMember?.display_name ?? "this user"}`;

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const success = await active.sendMessage(inputValue);
    if (success) {
      setInputValue("");
    }
  };

  const handleClear = async () => {
    const label =
      mode === "channel"
        ? "Clear the entire workspace chat?"
        : `Clear your conversation with ${selectedMember?.display_name ?? "this user"}?`;
    if (!confirm(`${label} This cannot be undone.`)) return;

    await active.clearMessages();
  };

  const getSenderProfile = (msg: ChatMessageType | DirectMessage) => {
    if (mode === "channel") {
      const m = msg as ChatMessageType;
      return members.find((p) => p.id === m.user_id);
    }
    const m = msg as DirectMessage;
    const otherId = m.sender_id === user?.id ? m.receiver_id : m.sender_id;
    return members.find((p) => p.id === otherId);
  };

  const getIsOwn = (msg: ChatMessageType | DirectMessage) => {
    if (mode === "channel") {
      return (msg as ChatMessageType).user_id === user?.id;
    }
    return (msg as DirectMessage).sender_id === user?.id;
  };

  return (
    <div className="page-container h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-6 pb-4">
        <div>
          <h1 className="page-title mb-2">Chat</h1>
          <p className="page-description">
            Team conversations and direct messages.
          </p>
        </div>
      </div>

      <div className="flex-1 flex rounded-xl shadow-[0px_4px_12px_rgba(139,92,246,0.04)] border border-slate-100 bg-white overflow-hidden min-h-[500px]">
        {/* Sidebar */}
        <div className="w-56 shrink-0 border-r border-slate-100 flex flex-col bg-[#fafafa]">
          <div className="p-3">
            <div className="px-2 py-1.5 mb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Channels
              </span>
            </div>
            <button
              onClick={() => {
                setMode("channel");
                setSelectedUserId(null);
                setInputValue("");
              }}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
                mode === "channel"
                  ? "bg-[#ede9fe] text-[#6d28d9] font-semibold"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Hash className="w-4 h-4 shrink-0" />
              <span className="truncate">general</span>
            </button>
          </div>

          <div className="border-t border-slate-100 flex-1 overflow-y-auto p-3">
            <div className="px-2 py-1.5 mb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Direct Messages
              </span>
            </div>

            {membersLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-slate-200 border-t-[#7b68ee] rounded-full animate-spin" />
              </div>
            ) : members.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4 px-2">
                No members found
              </p>
            ) : (
              <div className="space-y-0.5">
                {members.filter((m) => m.id !== user?.id).map((member) => (
                  <button
                    key={member.id}
                    onClick={() => {
                      setMode("dm");
                      setSelectedUserId(member.id);
                      setInputValue("");
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
                      mode === "dm" && selectedUserId === member.id
                        ? "bg-[#ede9fe] text-[#6d28d9] font-semibold"
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <Avatar className="w-5 h-5 shrink-0">
                      <AvatarImage
                        src={member.avatar_url ?? undefined}
                        alt={member.display_name ?? "User"}
                      />
                      <AvatarFallback className="text-[9px]">
                        {(member.display_name ?? "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">
                      {member.display_name ?? "Unknown"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-[#0b1c30] flex items-center gap-2">
                {mode === "channel" ? (
                  <Hash className="w-4 h-4 text-[#7b68ee]" />
                ) : (
                  <MessageCircle className="w-4 h-4 text-[#7b68ee]" />
                )}
                {headerTitle}
                {isAdmin && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                    <Shield className="w-3 h-3" />
                    Admin
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {headerDescription}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-md text-slate-400 hover:text-slate-600"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-lg">
                <DropdownMenuItem
                  className="cursor-pointer text-sm text-red-600 focus:text-red-600"
                  onClick={handleClear}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  Clear conversation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto">
            {active.isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-[#ede9fe] border-t-[#7b68ee] rounded-full animate-spin" />
              </div>
            ) : active.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-16 h-16 bg-[#f5f3ff] rounded-2xl flex items-center justify-center mb-6">
                  <MessageCircle className="w-8 h-8 text-[#7b68ee]" />
                </div>
                <h3 className="font-['Spline_Sans',sans-serif] text-xl font-bold text-[#0b1c30] mb-2">
                  {mode === "channel"
                    ? "No messages in #general"
                    : `No messages with ${selectedMember?.display_name ?? "this user"} yet`}
                </h3>
                <p className="font-['Inter',sans-serif] text-sm text-[#494454] max-w-sm">
                  {mode === "channel"
                    ? "Send the first message to your workspace team."
                    : `Send the first message to ${selectedMember?.display_name ?? "them"}.`}
                </p>
              </div>
            ) : (
              <div className="py-4">
                {active.messages.map((msg) => {
                  const profile = getSenderProfile(msg);
                  return (
                    <ChatMessage
                      key={msg.id}
                      message={msg as ChatMessageType & DirectMessage}
                      isOwn={getIsOwn(msg)}
                      isAdmin={isAdmin}
                      senderName={profile?.display_name ?? undefined}
                      senderAvatar={profile?.avatar_url ?? undefined}
                      onEdit={active.editMessage}
                      onDelete={active.deleteMessage}
                    />
                  );
                })}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="border-t border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2 bg-[#f8f7fc] border border-slate-200 rounded-xl focus-within:border-[#7b68ee] focus-within:ring-2 focus-within:ring-[#7b68ee]/20 transition-all p-1.5">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={
                  mode === "channel"
                    ? "Message #general"
                    : `Message @ ${selectedMember?.display_name ?? "user"}`
                }
                className="flex-1 bg-transparent border-none outline-none text-sm px-2 py-1.5 text-[#0b1c30] placeholder:text-[#94a3b8]"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="p-2 bg-[#7b68ee] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
