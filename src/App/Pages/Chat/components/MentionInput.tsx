import { useState, useRef, useEffect, useMemo, useCallback, forwardRef } from "react";
import { MentionDropdown, type MemberProfile } from "./MentionDropdown";

interface MentionInputProps {
  members: MemberProfile[];
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
  onTyping?: () => void;
}

export const MentionInput = forwardRef<HTMLTextAreaElement, MentionInputProps>(
  function MentionInput({ members, value, onChange, onSend, placeholder, disabled, onTyping }, ref) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [mentionOpen, setMentionOpen] = useState(false);
    const [mentionQuery, setMentionQuery] = useState("");
    const [mentionIndex, setMentionIndex] = useState(0);
    const [mentionStart, setMentionStart] = useState(-1);

    const filteredMembers = useMemo(() => {
      if (!mentionOpen) return [];
      return mentionQuery
        ? members.filter((m) =>
            m.display_name?.toLowerCase().includes(mentionQuery.toLowerCase())
          )
        : members;
    }, [members, mentionQuery, mentionOpen]);

    useEffect(() => {
      if (filteredMembers.length > 0 && mentionIndex >= filteredMembers.length) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMentionIndex(filteredMembers.length - 1);
      }
    }, [filteredMembers.length, mentionIndex]);

    const getMentionContext = useCallback((text: string, cursorPos: number) => {
      const beforeCursor = text.slice(0, cursorPos);
      const atIndex = beforeCursor.lastIndexOf("@");
      if (atIndex === -1) return null;
      if (atIndex > 0 && text[atIndex - 1] !== " " && text[atIndex - 1] !== "\n") return null;
      const query = beforeCursor.slice(atIndex + 1);
      if (query.includes(" ")) return null;
      return { start: atIndex, query };
    }, []);

    const selectMember = useCallback(
      (member: MemberProfile) => {
        if (mentionStart === -1) return;
        const before = value.slice(0, mentionStart);
        const after = value.slice(mentionStart + 1 + mentionQuery.length);
        const newValue = `${before}@${member.display_name} ${after}`;
        onChange(newValue);
        setMentionOpen(false);
        requestAnimationFrame(() => {
          const el = textareaRef.current;
          if (el) {
            const pos = before.length + (member.display_name?.length ?? 0) + 2;
            el.focus();
            el.setSelectionRange(pos, pos);
            el.style.height = "auto";
            el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
          }
        });
      },
      [mentionStart, mentionQuery, value, onChange]
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        const cursorPos = e.target.selectionStart;
        onChange(newValue);
        onTyping?.();
        const ctx = getMentionContext(newValue, cursorPos);
        if (ctx) {
          setMentionOpen(true);
          setMentionQuery(ctx.query);
          setMentionStart(ctx.start);
          setMentionIndex(0);
        } else {
          setMentionOpen(false);
          setMentionQuery("");
          setMentionStart(-1);
        }
      },
      [onChange, onTyping, getMentionContext]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (mentionOpen) {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setMentionIndex((i) => Math.min(i + 1, filteredMembers.length - 1));
            return;
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setMentionIndex((i) => Math.max(0, i - 1));
            return;
          }
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (filteredMembers[mentionIndex]) {
              selectMember(filteredMembers[mentionIndex]);
              return;
            }
          }
          if (e.key === "Escape") {
            e.preventDefault();
            setMentionOpen(false);
            return;
          }
        }
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          onSend();
        }
      },
      [mentionOpen, filteredMembers, mentionIndex, selectMember, onSend]
    );

    useEffect(() => {
      if (typeof ref === "function") {
        ref(textareaRef.current);
      } else if (ref) {
        ref.current = textareaRef.current;
      }
    }, [ref]);

    return (
      <div className="relative flex-1">
        {mentionOpen && filteredMembers.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 mb-1 z-50">
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-xl shadow-lg overflow-hidden">
              <MentionDropdown
                items={filteredMembers}
                selectedIndex={mentionIndex}
                onSelect={selectMember}
              />
            </div>
          </div>
        )}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={disabled}
          className="flex-1 bg-transparent border-none outline-none text-sm px-2 py-1.5 text-slate-900 placeholder:text-slate-400 resize-none max-h-30 w-full"
          style={{ minHeight: "36px" }}
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
          }}
        />
      </div>
    );
  }
);
