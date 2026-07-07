import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { ySyncPluginKey } from "y-prosemirror";

interface AwarenessState {
  user: { name: string; color: string };
  cursor: { anchor: number; head: number | null } | null;
  lastSeen: number;
}

export interface CollaborationCursorOptions {
  awarenessStates: Map<number, AwarenessState>;
  localClientId: number;
  user: { name: string; color: string };
}

const cursorPluginKey = new PluginKey("yjs-cursor");

export const CollaborationCursor = Extension.create<CollaborationCursorOptions>({
  name: "collaborationCursor",

  addOptions() {
    return {
      awarenessStates: new Map(),
      localClientId: 0,
      user: { name: "", color: "#7b68ee" },
    };
  },

  addProseMirrorPlugins() {
    const awarenessStates = this.options.awarenessStates;

    return [
      new Plugin({
        key: cursorPluginKey,
        state: {
          init(_, state) {
            const ystate = ySyncPluginKey.getState(state);
            if (!ystate?.doc) return DecorationSet.create(state.doc, []);
            return buildDecorations(state, awarenessStates, ystate.doc.clientID);
          },
          apply(tr, prev, _oldState, newState) {
            const ystate = ySyncPluginKey.getState(newState);
            if (ystate && ystate.isChangeOrigin) {
              return buildDecorations(newState, awarenessStates, ystate.doc.clientID);
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

function buildDecorations(
  state: ReturnType<typeof ySyncPluginKey.getState>,
  awarenessStates: Map<number, AwarenessState>,
  localClientId: number
) {
  const ystate = ySyncPluginKey.getState(state);
  if (!ystate?.doc) return DecorationSet.create(state.doc, []);

  const decorations: Decoration[] = [];

  awarenessStates.forEach((aw, clientId) => {
    if (clientId === localClientId) return;
    const cursor = aw.cursor;
    if (!cursor) return;

    try {
      const user = { name: aw.user.name || "Unknown", color: aw.user.color || "#7b68ee" };
      if (cursor.head !== null && cursor.head !== undefined) {
        decorations.push(
          Decoration.inline(cursor.anchor, cursor.head, {
            class: "collab-cursor-selection",
            style: `background-color: ${user.color}33; border-bottom: 2px solid ${user.color};`,
          })
        );
      }
      decorations.push(
        Decoration.widget(cursor.anchor, () => {
          const el = document.createElement("span");
          el.className = "collab-cursor";
          el.style.cssText = "position:relative;";
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
    } catch {}
  });

  return DecorationSet.create(state.doc, decorations);
}
