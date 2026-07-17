import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  MessageCircle,
  MessageSquare,
  Hash,
  Send,
  Trash2,
  MoreHorizontal,
  Shield,
  Paperclip,
  X,
  Loader2,
  Menu,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/hooks/useChat";
import { useDirectMessages, type DirectMessage, type FileAttachment } from "@/hooks/useDirectMessages";
import type { ChatMessage as ChatMessageType } from "@/hooks/useChat";
import { ChatMessage } from "./components/ChatMessage";
import { MentionInput } from "./components/MentionInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
import { useGlobalPresence } from "@/hooks/useGlobalPresence";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";


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
  const [mode, setMode] = useState<ChatMode>("channel");
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<{ file: File; preview?: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const onlineUsers = useGlobalPresence();
  const groupChat = useChat();
  const dmChat = useDirectMessages(
    mode === "dm" ? selectedUserId : null
  );

  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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
  }, [currentWorkspaceId, user]);

  useEffect(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, [groupChat.messages, dmChat.messages, groupChat, dmChat]);

  useEffect(() => {
    if (mode === "channel" && groupChat.messages.length > 0 && user) {
      const latest = groupChat.messages.filter(m => m.user_id !== user.id && m.status !== "read");
      latest.forEach(m => groupChat.markAsRead(m.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, groupChat.messages, groupChat.markAsRead, user]);

  const hasMore = mode === "channel" ? groupChat.hasMore ?? false : false;
  const isLoadingMore = mode === "channel" ? groupChat.isLoadingMore ?? false : false;
  const groupLoadMore = mode === "channel" ? groupChat.loadMoreMessages : undefined;
  const loadMoreMessages = useCallback(() => {
    groupLoadMore?.();
  }, [groupLoadMore]);

  const scrollPosRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const prevLoadingMoreRef = useRef(isLoadingMore);

  if (!isLoadingMore && prevLoadingMoreRef.current) {
    loadingMoreRef.current = false;
  }
  prevLoadingMoreRef.current = isLoadingMore;

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !hasMore) return;

    const handleScroll = () => {
      if (container.scrollTop < 100 && hasMore && !loadingMoreRef.current) {
        loadingMoreRef.current = true;
        scrollPosRef.current = container.scrollHeight;
        loadMoreMessages();
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMore, loadMoreMessages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!isLoadingMore && scrollPosRef.current > 0 && container) {
      const newScrollHeight = container.scrollHeight;
      container.scrollTop = newScrollHeight - scrollPosRef.current;
      scrollPosRef.current = 0;
    }
  }, [isLoadingMore]);

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
    if (!inputValue.trim() && !pendingFile) return;

    let fileAttachment: FileAttachment | undefined;

    if (pendingFile) {
      setUploading(true);
      try {
        const ext = pendingFile.file.name.split(".").pop();
        const filePath = `${currentWorkspaceId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("chat-attachments")
          .upload(filePath, pendingFile.file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("chat-attachments")
          .getPublicUrl(filePath);

        fileAttachment = {
          url: urlData.publicUrl,
          name: pendingFile.file.name,
          size: pendingFile.file.size,
          mimeType: pendingFile.file.type,
        };
      } catch (err) {
        console.error("Upload error:", err);
        toast.error("Failed to upload file");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    const success = await active.sendMessage(inputValue, fileAttachment);
    if (!success) {
      toast.error("Failed to send message");
      return;
    }

    if (inputValue.includes("@")) {
      for (const member of members) {
        if (!member.display_name || member.id === user?.id) continue;
        const escaped = member.display_name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`@${escaped}\\b`);
        if (regex.test(inputValue)) {
          supabase.from("notifications").insert({
            user_id: member.id,
            workspace_id: currentWorkspaceId,
            type: "mention",
            title: `You were mentioned in #general`,
            body: inputValue.slice(0, 120),
            link: "/chat",
          }).then(({ error }) => {
            if (error) console.error("Error creating mention notification:", error);
          });
        }
      }
    }

    setInputValue("");
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }

    const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
    setPendingFile({ file, preview });
  };

  const handleClear = () => {
    setClearConfirmOpen(true);
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

  const clearLabel = mode === "channel"
    ? "Clear the entire workspace chat?"
    : `Clear your conversation with ${selectedMember?.display_name ?? "this user"}?`;

  const typingText = active.typingUsers?.length === 1
    ? `${active.typingUsers[0].displayName} is typing...`
    : active.typingUsers && active.typingUsers.length > 1
      ? `${active.typingUsers[0].displayName} and ${active.typingUsers.length - 1} others are typing...`
      : null;

  const renderSidebarContent = () => (
    <>
      <div className="p-3">
        <div className="px-2 py-1.5 mb-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Channels
          </span>
        </div>
        <button
          onClick={() => {
            setMode("channel");
            setSelectedUserId(null);
            setInputValue("");
            setSidebarOpen(false);
          }}
          className={cn(
            "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            mode === "channel"
              ? "bg-cu-purple/10 text-cu-purple font-semibold"
              : "text-muted-foreground hover:bg-muted"
          )}
          aria-label="Switch to general channel"
        >
          <Hash className="w-4 h-4 shrink-0" />
          <span className="truncate">general</span>
        </button>
      </div>

      <div className="border-t border-border flex-1 overflow-y-auto p-3">
        <div className="px-2 py-1.5 mb-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Direct Messages
          </span>
        </div>

        {membersLoading ? (
          <div className="space-y-2 px-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5">
                <Skeleton className="w-5 h-5 rounded-full shrink-0" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4 px-2">
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
                  setSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  mode === "dm" && selectedUserId === member.id
                    ? "bg-cu-purple/10 text-cu-purple font-semibold"
                    : "text-muted-foreground hover:bg-muted"
                )}
                aria-label={`Direct message ${member.display_name ?? "user"}`}
              >
                <span className="relative inline-block shrink-0">
                  <Avatar className="w-5 h-5">
                    <AvatarImage
                      src={member.avatar_url ?? undefined}
                      alt={member.display_name ?? "User"}
                    />
                    <AvatarFallback className="text-[9px]">
                      {(member.display_name ?? "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {onlineUsers.has(member.id) && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-background" />
                  )}
                </span>
                <span className="truncate">
                  {member.display_name ?? "Unknown"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Used instead of the Bad looking console dialog */}
      <ConfirmDialog
        open={clearConfirmOpen}
        onOpenChange={setClearConfirmOpen}
        onConfirm={() => { setClearConfirmOpen(false); active.clearMessages(); }}
        title="Clear Messages"
        description={`${clearLabel} This cannot be undone.`}
        confirmLabel="Clear"
        destructive
      />
      <div className="flex flex-col w-full h-full min-h-0 pt-4">

      <div className="flex-1 flex flex-col md:flex-row rounded-xl shadow-[0px_4px_12px_rgba(139,92,246,0.04)] border border-border bg-card overflow-hidden min-h-0 relative">
        {/* Mobile sidebar - slides in from right within the card */}
        {sidebarOpen && (
          <div className="md:hidden absolute inset-y-0 right-0 z-20 w-64 bg-white dark:bg-[#0f172a] border-l border-border shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0 bg-white dark:bg-[#0f172a]">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Chats</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Close chat sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 bg-white dark:bg-[#0f172a]">
              {renderSidebarContent()}
            </div>
          </div>
        )}

        {/* Desktop sidebar */}
        <div className="hidden md:flex md:w-56 shrink-0 border-r border-border flex-col bg-muted/30 overflow-y-auto">
          {renderSidebarContent()}
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header bar */}
          <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                {mode === "channel" ? (
                  <Hash className="w-4 h-4 text-cu-purple" />
                ) : (
                  <MessageCircle className="w-4 h-4 text-cu-purple" />
                )}
                {headerTitle}
                {isAdmin && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                    <Shield className="w-3 h-3" />
                    Admin
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {headerDescription}
              </p>
              {typingText && (
                <p className="text-[11px] text-cu-purple italic mt-0.5 animate-pulse">
                  {typingText}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-7 w-7 rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle chat sidebar"
              >
                {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
              {(mode === "dm" || isAdmin) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label="Chat options"
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
              )}
            </div>
          </div>

          {/* Messages area */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto">
            {active.isLoading ? (
              <div className="space-y-4 py-3 sm:py-4 px-3 sm:px-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={`flex items-start gap-3 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                    <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                    <div className={`space-y-1.5 ${i % 2 === 0 ? '' : 'items-end flex flex-col'}`}>
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className={`h-16 ${i % 2 === 0 ? 'w-64' : 'w-48'} rounded-xl`} />
                      <Skeleton className={`h-3 ${i % 2 === 0 ? 'w-20' : 'w-16'}`} />
                    </div>
                  </div>
                ))}
              </div>
            ) : active.messages.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No messages yet"
                description={mode === "channel" ? "Start a conversation in this channel." : "Start a conversation."}
                action={{ label: "Send a message", onClick: () => inputRef.current?.focus() }}
              />
            ) : (
              <div className="py-2 sm:py-4">
                {mode === "channel" && isLoadingMore && (
                    <div className="flex justify-center py-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Loading older messages...
                    </div>
                  </div>
                )}
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
          <div className="border-t border-border px-3 sm:px-4 py-2 sm:py-3">
            {pendingFile && (
              <div className="flex items-center gap-2 mb-2 px-2 py-1.5 bg-muted rounded-lg border border-border">
                {pendingFile.preview ? (
                  <img src={pendingFile.preview} alt="" className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded" />
                ) : (
                  <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                )}
                <span className="text-xs sm:text-sm text-foreground/70 flex-1 truncate">{pendingFile.file.name}</span>
                <button
                  onClick={() => {
                    setPendingFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="p-1.5 hover:bg-muted rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Remove file attachment"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            )}
            <div className="flex items-end gap-1.5 sm:gap-2 bg-muted border border-border rounded-xl focus-within:border-cu-purple focus-within:ring-2 focus-within:ring-cu-purple/20 transition-all p-1.5">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="p-2 sm:p-2.5 text-muted-foreground hover:text-cu-purple rounded-lg transition-colors shrink-0 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Attach file"
              >
                <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                className="hidden"
                onChange={handleFileSelect}
              />
              <MentionInput
                ref={inputRef}
                members={members}
                value={inputValue}
                onChange={setInputValue}
                onSend={handleSend}
                placeholder={
                  mode === "channel"
                    ? "Message #general"
                    : `Message @ ${selectedMember?.display_name ?? "user"}`
                }
                onTyping={() => active.startTyping?.()}
              />
              <button
                onClick={handleSend}
                disabled={(!inputValue.trim() && !pendingFile) || uploading}
                className="p-2 sm:p-2.5 bg-cu-purple text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Send message"
              >
                {uploading ? (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
