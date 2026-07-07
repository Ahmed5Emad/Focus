import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { ySyncPluginKey } from "y-prosemirror";
import type { HocuspocusProvider } from "@hocuspocus/provider";

export interface CollaborationCursorOptions {
  provider: HocuspocusProvider | null;
  user: { name: string; color: string };
}

const cursorPluginKey = new PluginKey("yjs-cursor");

export const CollaborationCursor = Extension.create<CollaborationCursorOptions>({
  name: "collaborationCursor",

  addOptions() {
    return {
      provider: null,
      user: { name: "", color: "#7b68ee" },
    };
  },

  addProseMirrorPlugins() {
    const provider = this.options.provider;
    if (!provider) return [];

    const awareness = provider.awareness;

    return [
      new Plugin({
        key: cursorPluginKey,
        state: {
          init(_, state) {
            const ystate = ySyncPluginKey.getState(state);
            if (!ystate?.doc) return DecorationSet.create(state.doc, []);
            return buildDecorations(state, awareness);
          },
          apply(tr, prev, _oldState, newState) {
            const ystate = ySyncPluginKey.getState(newState);
            const meta = tr.getMeta(cursorPluginKey);
            if ((ystate && ystate.isChangeOrigin) || (meta && meta.awarenessUpdated)) {
              return buildDecorations(newState, awareness);
            }
            return prev.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            return cursorPluginKey.getState(state);
          },
        },
      }),
    ];
  },
});

function buildDecorations(state: Parameters<typeof ySyncPluginKey.getState>[0], awareness: any) {
  const ystate = ySyncPluginKey.getState(state);
  if (!ystate?.doc) return DecorationSet.create(state.doc, []);

  const decorations: Decoration[] = [];
  const y = ystate.doc;

  awareness.getStates().forEach((aw: any, clientId: number) => {
    if (clientId === y.clientID) return;
    const cursor = aw.cursor;
    if (!cursor) return;

    try {
      const user = { name: cursor.name || "Unknown", color: cursor.color || "#7b68ee" };
      if (cursor.selection) {
        const { anchor, head } = cursor.selection;
        if (anchor !== undefined && head !== undefined) {
          decorations.push(
            Decoration.inline(anchor, head, {
              class: "collab-cursor-selection",
              style: `background-color: ${user.color}33; border-bottom: 2px solid ${user.color};`,
            })
          );
        }
      }
      if (cursor.anchor !== undefined) {
        decorations.push(
          Decoration.widget(cursor.anchor, () => {
            const el = document.createElement("span");
            el.className = "collab-cursor";
            el.style.cssText = `position:relative;`;
            const dot = document.createElement("span");
            dot.style.cssText = `position:absolute;bottom:0;left:0;width:2px;height:1.2em;background:${user.color};`;
            el.appendChild(dot);
            const label = document.createElement("span");
            label.textContent = user.name;
            label.style.cssText = `position:absolute;bottom:100%;left:0;font-size:10px;font-weight:600;white-space:nowrap;padding:1px 4px;border-radius:3px 3px 3px 0;color:white;background:${user.color};pointer-events:none;`;
            el.appendChild(label);
            return el;
          })
        );
      }
    } catch {}
  });

  return DecorationSet.create(state.doc, decorations);
}
