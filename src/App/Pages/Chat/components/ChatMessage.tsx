import { useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MoreHorizontal, Pencil, Trash2, Check, X, FileIcon, Download } from "lucide-react";
import type { ChatMessage } from "@/hooks/useChat";

const statusLabels: Record<string, string> = {
  sent: "Sent",
  delivered: "Delivered",
  read: "Read",
};

interface ChatMessageProps {
  message: ChatMessage;
  isOwn: boolean;
  isAdmin?: boolean;
  senderName?: string;
  senderAvatar?: string;
  onEdit: (id: string, newContent: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function isImage(mimeType: string) {
  return mimeType.startsWith("image/");
}

export function ChatMessage({
  message,
  isOwn,
  isAdmin,
  senderName,
  senderAvatar,
  onEdit,
  onDelete,
}: ChatMessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content);
  const [showMenu, setShowMenu] = useState(false);

  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  const editedTime = new Date(message.updated_at).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  const isEdited = message.updated_at !== message.created_at;

  const handleSaveEdit = async () => {
    const success = await onEdit(message.id, editValue);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditValue(message.content);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const fileAttach = message.file_attachment;

  return (
    <div
      className={cn(
        "group flex gap-2 sm:gap-3 px-3 sm:px-4 py-2 hover:bg-muted/50 transition-colors rounded-lg relative",
        isOwn && "flex-row-reverse"
      )}
    >
      <Avatar className="mt-0.5 shrink-0 w-7 h-7 sm:w-8 sm:h-8">
        <AvatarImage src={senderAvatar} alt={senderName ?? "User"} />
        <AvatarFallback className="text-[10px] sm:text-xs">
          {(senderName ?? "U").charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className={cn("flex flex-col max-w-[80%] sm:max-w-[70%]", isOwn && "items-end")}>
        <div className="flex items-baseline gap-1.5 sm:gap-2 mb-0.5 flex-wrap">
          <span className="text-xs sm:text-sm font-semibold text-foreground">
            {senderName ?? "Unknown"}
          </span>
          <span className="text-[10px] sm:text-[11px] text-muted-foreground">{time}</span>
          {isEdited && (
            <span className="text-[10px] sm:text-[11px] text-muted-foreground italic">
              (edited {editedTime})
            </span>
          )}
        </div>

        {fileAttach && (
          <div className={cn("mb-1.5 max-w-full", isOwn && "self-end")}>
            {isImage(fileAttach.mimeType) ? (
              <a
                href={fileAttach.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-lg border border-border hover:opacity-90 transition-opacity"
              >
                <img
                  src={fileAttach.url}
                  alt={fileAttach.name}
                  className="max-w-full sm:max-w-60 max-h-45 object-cover"
                />
              </a>
            ) : (
              <a
                href={fileAttach.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm transition-colors",
                  isOwn
                    ? "bg-cu-purple/20 border-cu-purple/30 text-white"
                    : "bg-muted border-border text-foreground hover:bg-muted/80"
                )}
              >
                <FileIcon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{fileAttach.name}</p>
                  <p className="text-[10px] opacity-60">{formatFileSize(fileAttach.size)}</p>
                </div>
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 opacity-60" />
              </a>
            )}
          </div>
        )}

        {isEditing ? (
          <div className="flex items-center gap-2 w-full">
            <input
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className={cn(
                "flex-1 px-2 sm:px-3 py-1 sm:py-1.5 text-sm rounded-lg border outline-none",
                "border-cu-purple ring-1 ring-cu-purple/20 bg-card text-foreground"
              )}
            />
            <button
              onClick={handleSaveEdit}
              className="p-1 sm:p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-md transition-colors"
            >
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={handleCancelEdit}
              className="p-1 sm:p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        ) : (
          <>
            {message.content && (
              <div
                className={cn(
                  "px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm leading-relaxed rounded-2xl sm:rounded-xl",
                  isOwn
                    ? "bg-cu-purple text-white rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm",
                )}
              >
                {message.content}
              </div>
            )}
            {isOwn && (
              <span className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                <span className={cn(
                  message.status === "read" && "text-cu-purple",
                  message.status === "delivered" && "text-cu-purple",
                )}>
                  {statusLabels[message.status] ?? "Sent"}
                </span>
              </span>
            )}
          </>
        )}
      </div>

      {(isOwn || isAdmin) && !isEditing && (
        <div className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 rounded-lg">
              {isOwn && (
                <DropdownMenuItem
                  className="cursor-pointer text-sm"
                  onClick={() => {
                    setShowMenu(false);
                    setIsEditing(true);
                    setEditValue(message.content);
                  }}
                >
                  <Pencil className="w-3.5 h-3.5 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {isOwn && <DropdownMenuSeparator />}
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600 text-sm"
                onClick={() => {
                  setShowMenu(false);
                  onDelete(message.id);
                }}
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                {isOwn ? "Delete" : "Delete (admin)"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
