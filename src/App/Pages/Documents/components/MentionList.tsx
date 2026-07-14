import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Mention from "@tiptap/extension-mention";
import type { MentionOptions } from "@tiptap/extension-mention";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

interface MemberItem {
  id: string;
  label: string;
  avatar_url: string | null;
}

let memberCache: MemberItem[] = [];

export async function prefetchMembers(workspaceId: string) {
  if (memberCache.length > 0) return;
  const supabase = createClient();
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
    console.error("Failed to prefetch members:", e);
  }
}

function SuggestionList({
  items,
  command,
  clientRect,
}: {
  items: MemberItem[];
  command: (item: MemberItem) => void;
  clientRect: (() => DOMRect) | null;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setSelectedIndex(0), [items.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % items.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + items.length) % items.length);
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        if (items[selectedIndex]) command(items[selectedIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        command({ id: "", label: "", avatar_url: null });
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [items, command, selectedIndex]);

  if (items.length === 0) return null;

  const rect = clientRect?.();
  const style: React.CSSProperties = rect
    ? { position: "fixed", top: rect.bottom + 4, left: rect.left, zIndex: 9999 }
    : { position: "fixed", top: 0, left: 0, zIndex: 9999 };

  return createPortal(
    <div ref={containerRef} style={style} className="bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden min-w-[180px] py-1">
      {items.map((item, i) => (
        <button
          key={item.id}
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors cursor-pointer ${
            i === selectedIndex ? "bg-[#f5f3ff] text-[#7c3aed]" : "text-slate-700 hover:bg-slate-50"
          }`}
          onMouseDown={(e) => { e.preventDefault(); command(item); }}
          onMouseEnter={() => setSelectedIndex(i)}
        >
          <Avatar className="w-5 h-5">
            <AvatarImage src={item.avatar_url ?? undefined} />
            <AvatarFallback className="text-[9px]">{item.label.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{item.label}</span>
        </button>
      ))}
    </div>,
    document.body,
  );
}

export function createMentionExtension(options: { workspaceId: string }) {
  return Mention.configure({
    HTMLAttributes: { class: "mention" },
    suggestion: {
      items: ({ query }) =>
        memberCache
          .filter((m) => m.label.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 6),
      render: () => {
        let dom: HTMLDivElement | null = null;

        return {
          onStart: (props) => {
            dom = document.createElement("div");
            document.body.appendChild(dom);
            const root = document.createElement("div");
            dom.appendChild(root);
            props.editor.view.dom.parentElement?.appendChild(dom);
          },
          onUpdate(props) {
            //
          },
          onExit() {
            dom?.remove();
            dom = null;
          },
          onKeyDown(props) {
            return false;
          },
        };
      },
    },
  } as Partial<MentionOptions>);
}
