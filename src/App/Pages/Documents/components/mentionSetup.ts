import Mention from "@tiptap/extension-mention";
import { PluginKey } from "@tiptap/pm/state";
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

function renderPopup(items: MemberItem[], getClientRect: () => DOMRect | null, onSelect: (item: MemberItem) => void): HTMLDivElement {
  const popup = document.createElement("div");
  popup.style.cssText = "position:fixed;z-index:9999;background:white;border-radius:8px;box-shadow:0 10px 40px rgba(0,0,0,0.15);border:1px solid #e2e8f0;overflow:hidden;min-width:180px;padding:4px 0;font-family:Inter,sans-serif;";

  const updatePosition = () => {
    const rect = getClientRect();
    if (rect) {
      popup.style.top = `${rect.bottom + 4}px`;
      popup.style.left = `${rect.left}px`;
    }
  };

  items.forEach((item, i) => {
    const btn = document.createElement("button");
    btn.style.cssText = `width:100%;display:flex;align-items:center;gap:8px;padding:6px 12px;font-size:13px;text-align:left;cursor:pointer;border:none;background:${i === 0 ? "#f5f3ff" : "transparent"};color:${i === 0 ? "#7c3aed" : "#334155"};`;
    btn.onmousedown = (e) => { e.preventDefault(); onSelect(item); };
    btn.innerHTML = `<span style="width:20px;height:20px;border-radius:9999px;background:#e2e8f0;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;color:#64748b;flex-shrink:0;">${item.label.charAt(0).toUpperCase()}</span><span style="font-weight:500;">${item.label}</span>`;
    popup.appendChild(btn);
  });

  updatePosition();
  document.body.appendChild(popup);

  const observer = new ResizeObserver(updatePosition);
  observer.observe(popup);
  return popup;
}

export function createMentionExtension() {
  return Mention.configure({
    HTMLAttributes: { class: "mention px-1 py-0.5 rounded bg-[#f5f3ff] text-[#7c3aed] font-medium" },
    suggestion: {
      char: "@",
      pluginKey: new PluginKey("mention"),
      allowSpaces: false,
      items: ({ query }) =>
        memberCache
          .filter((m) => m.label.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 6),
      render: () => {
        let popup: HTMLDivElement | null = null;

        return {
          onStart: (props) => {
            const items = props.items as MemberItem[];
            if (items.length === 0 || !props.clientRect) return;
            popup = renderPopup(items, () => props.clientRect!(), (item) => {
              props.command({ id: item.id, label: item.label });
            });
          },
          onUpdate: (props) => {
            popup?.remove();
            popup = null;
            const items = props.items as MemberItem[];
            if (items.length === 0 || !props.clientRect) return;
            popup = renderPopup(items, () => props.clientRect!(), (item) => {
              props.command({ id: item.id, label: item.label });
            });
          },
          onExit: () => {
            popup?.remove();
            popup = null;
          },
          onKeyDown: () => false,
        };
      },
    },
  });
}
