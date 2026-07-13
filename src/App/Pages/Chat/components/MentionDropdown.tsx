import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface MemberProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface MentionDropdownProps {
  items: MemberProfile[];
  selectedIndex: number;
  onSelect: (member: MemberProfile) => void;
}

export function MentionDropdown({ items, selectedIndex, onSelect }: MentionDropdownProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  return (
    <div ref={listRef} className="max-h-48 overflow-y-auto py-1">
      {items.map((member, i) => (
        <button
          key={member.id}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors",
            i === selectedIndex
              ? "bg-cu-purple/10 text-cu-purple"
              : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          )}
          onClick={() => onSelect(member)}
        >
          <Avatar className="w-5 h-5 shrink-0">
            <AvatarImage src={member.avatar_url ?? undefined} alt={member.display_name ?? "User"} />
            <AvatarFallback className="text-[9px]">
              {(member.display_name ?? "U").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{member.display_name}</span>
        </button>
      ))}
    </div>
  );
}
