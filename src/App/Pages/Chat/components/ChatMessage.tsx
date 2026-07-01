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
import { MoreHorizontal, Pencil, Trash2, Check, X } from "lucide-react";
import type { ChatMessage } from "@/hooks/useChat";

interface ChatMessageProps {
  message: ChatMessage;
  isOwn: boolean;
  isAdmin?: boolean;
  senderName?: string;
  senderAvatar?: string;
  onEdit: (id: string, newContent: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
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

  return (
    <div
      className={cn(
        "group flex gap-3 px-4 py-2 hover:bg-[#f8f7fc] transition-colors rounded-lg relative",
        isOwn && "flex-row-reverse"
      )}
    >
      <Avatar className="mt-0.5 shrink-0 w-8 h-8">
        <AvatarImage src={senderAvatar} alt={senderName ?? "User"} />
        <AvatarFallback className="text-xs">
          {(senderName ?? "U").charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className={cn("flex flex-col max-w-[70%]", isOwn && "items-end")}>
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="text-sm font-semibold text-[#0b1c30]">
            {senderName ?? "Unknown"}
          </span>
          <span className="text-[11px] text-[#94a3b8]">{time}</span>
          {isEdited && (
            <span className="text-[11px] text-[#94a3b8] italic">
              (edited {editedTime})
            </span>
          )}
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2 w-full">
            <input
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className={cn(
                "flex-1 px-3 py-1.5 text-sm rounded-lg border outline-none",
                "border-[#7b68ee] ring-1 ring-[#7b68ee]/20 bg-white text-[#0b1c30]"
              )}
            />
            <button
              onClick={handleSaveEdit}
              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancelEdit}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            className={cn(
              "px-3 py-2 text-sm leading-relaxed rounded-lg",
              isOwn
                ? "bg-[#7b68ee] text-white"
                : "bg-white border border-slate-100 shadow-sm text-[#0b1c30]",
            )}
          >
            {message.content}
          </div>
        )}
      </div>

      {(isOwn || isAdmin) && !isEditing && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-md text-[#94a3b8] hover:text-[#0b1c30] hover:bg-slate-100"
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
