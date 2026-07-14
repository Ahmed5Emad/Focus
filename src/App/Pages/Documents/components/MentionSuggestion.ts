import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import type { SuggestionOptions, SuggestionProps } from "@tiptap/suggestion";
import { createClient } from "@/lib/supabase/client";

interface MemberItem {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

const supabase = createClient();
let cachedMembers: MemberItem[] = [];

export async function fetchWorkspaceMembers(workspaceId: string): Promise<MemberItem[]> {
  if (cachedMembers.length > 0) return cachedMembers;
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
    cachedMembers = userIds.map((id) => {
      const p = profileMap.get(id);
      return {
        id,
        display_name: p?.display_name ?? emailMap.get(id)?.split("@")[0] ?? "Unknown",
        avatar_url: p?.avatar_url ?? null,
      };
    });
    return cachedMembers;
  } catch {
    return [];
  }
}

export function clearMemberCache() {
  cachedMembers = [];
}

export const mentionSuggestion: Omit<SuggestionOptions, "editor"> = {
  items: ({ query }: { query: string }): MemberItem[] => {
    return cachedMembers
      .filter((m) => m.display_name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  },

  render: () => {
    let component: ReactRenderer;
    let popup: ReturnType<typeof tippy>;

    return {
      onStart: (props: SuggestionProps) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) return;
        popup = tippy("body", {
          getReferenceClientRect: props.clientRect as () => DOMRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });
      },

      onUpdate(props: SuggestionProps) {
        component.updateProps(props);
        if (!props.clientRect) return;
        popup?.[0]?.setProps({
          getReferenceClientRect: props.clientRect as () => DOMRect,
        });
      },

      onKeyDown(props: SuggestionProps) {
        if (props.event.key === "Escape") {
          popup?.[0]?.hide();
          return true;
        }
        return (component.ref as { onKeyDown: (e: KeyboardEvent) => boolean } | null)?.onKeyDown(props.event) ?? false;
      },

      onExit() {
        popup?.[0]?.destroy();
        component?.destroy();
      },
    };
  },
};

import { useState, useCallback, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function MentionList({
  items,
  command,
}: {
  items: MemberItem[];
  command: (item: { id: string; label: string }) => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = useCallback(
    (index: number) => {
      const item = items[index];
      if (item) command({ id: item.id, label: item.display_name });
    },
    [command, items],
  );

  const onKeyDown = useCallback(
    ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex((i) => (i > 0 ? i - 1 : items.length - 1));
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((i) => (i < items.length - 1 ? i + 1 : 0));
        return true;
      }
      if (event.key === "Enter") {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
    [selectItem, selectedIndex, items.length],
  );

  useEffect(() => setSelectedIndex(0), [items]);

  return items.length > 0 ? (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden min-w-[160px] py-1">
      {items.map((item, index) => (
        <button
          key={item.id}
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors cursor-pointer ${
            index === selectedIndex ? "bg-[#f5f3ff] text-[#7c3aed]" : "text-slate-700 hover:bg-slate-50"
          }`}
          onClick={() => selectItem(index)}
        >
          <Avatar className="w-5 h-5">
            <AvatarImage src={item.avatar_url ?? undefined} />
            <AvatarFallback className="text-[9px]">{item.display_name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          {item.display_name}
        </button>
      ))}
    </div>
  ) : null;
}
