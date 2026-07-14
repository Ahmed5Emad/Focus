import { useCallback, useEffect, useMemo, useRef } from "react";
import { useEditor, EditorContent, type Editor as TiptapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { CollaborationCursor } from "./CollaborationCursor";
import * as Y from "yjs";
import { useAuth } from "@/contexts/AuthContext";
import { Toolbar } from "./Toolbar";
import { createClient } from "@/lib/supabase/client";
import { createMentionExtension, prefetchMembers } from "./mentionSetup";

const lowlight = createLowlight(common);

const USER_COLORS = [
  "#7b68ee", "#ff5cba", "#00bdf9", "#2ece89",
  "#ff8d36", "#e65054", "#fadb14", "#00a843",
];

function hashUserId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function uint8ToBase64(uint8: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < uint8.length; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  return btoa(binary);
}

function base64ToUint8(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function uint8ToHex(uint8: Uint8Array): string {
  return Array.from(uint8)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToUint8(hex: string): Uint8Array {
  const clean = hex.startsWith("\\x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16);
  }
  return bytes;
}

interface AwarenessState {
  user: { name: string; color: string };
  cursor: { anchor: number; head: number | null } | null;
  lastSeen: number;
}

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

interface EditorProps {
  documentId: string;
  documentTitle: string;
  onTitleChange: (title: string) => void;
  onConnectionChange?: (status: ConnectionStatus) => void;
  editorRef?: React.MutableRefObject<TiptapEditor | null>;
}

type SupabaseClient = ReturnType<typeof createClient>;
type BroadcastChannel = ReturnType<SupabaseClient["channel"]>;

function safeSend(
  channel: BroadcastChannel | null,
  payload: { type: "broadcast"; event: string; payload: unknown }
): boolean {
  if (!channel) return false;
  try {
    void channel.send(payload as Parameters<BroadcastChannel["send"]>[0]);
    return true;
  } catch (e) {
    console.error("Broadcast send failed:", e);
    return false;
  }
}

function refreshCursorDecorations(editor: TiptapEditor | null) {
  if (!editor) return;
  try {
    editor.view.dispatch(editor.state.tr.setMeta("yjs-cursor-update", true));
  } catch {
    /* editor may be mid-destroy; safe to ignore */
  }
}

export function Editor({ documentId, documentTitle, onTitleChange, onConnectionChange, editorRef: externalEditorRef }: EditorProps) {
  const { user, currentWorkspaceId } = useAuth();
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Anonymous";
  const userColorIndex = user ? hashUserId(user.id) % USER_COLORS.length : 0;
  const userColor = USER_COLORS[userColorIndex];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ydoc = useMemo(() => new Y.Doc(), [documentId]);
  const dirtyRef = useRef(false);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const editorRef = useRef<TiptapEditor | null>(null);
  const awarenessRef = useRef<Map<number, AwarenessState>>(new Map());
  const snapshotLoadedRef = useRef(false);
  const pendingUpdatesRef = useRef<Uint8Array[]>([]);
  const connectionStateRef = useRef<ConnectionStatus>("connecting");
  const onConnectionChangeRef = useRef<((s: ConnectionStatus) => void) | undefined>(onConnectionChange);

  useEffect(() => {
    onConnectionChangeRef.current = onConnectionChange;
  }, [onConnectionChange]);

  useEffect(() => {
    if (currentWorkspaceId) prefetchMembers(currentWorkspaceId);
  }, [currentWorkspaceId]);

  const setConnectionState = useCallback((s: ConnectionStatus) => {
    if (connectionStateRef.current === s) return;
    connectionStateRef.current = s;
    onConnectionChangeRef.current?.(s);
  }, []);

  useEffect(() => {
    let destroyed = false;

    setConnectionState("connecting");

    const applyUpdateSafe = (uint8: Uint8Array) => {
      if (snapshotLoadedRef.current) {
        try {
          Y.applyUpdate(ydoc, uint8);
        } catch (e) {
          console.error("Remote sync error:", e);
        }
      } else {
        pendingUpdatesRef.current.push(uint8);
      }
    };

    const fetchSnapshot = async (): Promise<boolean> => {
      try {
        const { data, error } = await supabase
          .from("documents")
          .select("yjs_snapshot")
          .eq("id", documentId)
          .single();
        if (error) {
          console.warn("Snapshot fetch error:", error.message);
          return false;
        }
        if (destroyed) return false;
        if (data?.yjs_snapshot) {
          try {
            Y.applyUpdate(ydoc, hexToUint8(data.yjs_snapshot as string));
          } catch (e) {
            console.error("Failed to load Yjs snapshot:", e);
          }
        }
        return true;
      } catch (e) {
        console.error("Snapshot fetch exception:", e);
        return false;
      }
    };

    const flushPendingUpdates = () => {
      const pending = pendingUpdatesRef.current;
      pendingUpdatesRef.current = [];
      for (const u of pending) {
        try {
          Y.applyUpdate(ydoc, u);
        } catch (e) {
          console.error("Flush pending update error:", e);
        }
      }
    };

    const loadSnapshotAndQueue = async () => {
      await fetchSnapshot();
      if (destroyed) return;
      snapshotLoadedRef.current = true;
      flushPendingUpdates();
    };

    void loadSnapshotAndQueue();

    const channel = supabase.channel(`document-${documentId}`);
    channelRef.current = channel;

    channel.on("broadcast", { event: "yjs-update" }, ({ payload }) => {
      if (destroyed) return;
      applyUpdateSafe(base64ToUint8(payload.data));
    });

    channel.on("broadcast", { event: "awareness" }, ({ payload }) => {
      if (destroyed || payload.clientId === ydoc.clientID) return;
      const incoming = payload.state as AwarenessState;
      awarenessRef.current.set(payload.clientId, { ...incoming, lastSeen: Date.now() });
      refreshCursorDecorations(editorRef.current);
    });

    channel.on("broadcast", { event: "sync-request" }, ({ payload }) => {
      if (destroyed || payload.clientId === ydoc.clientID) return;
      if (!snapshotLoadedRef.current) return;
      const stateUpdate = Y.encodeStateAsUpdate(ydoc);
      safeSend(channel, {
        type: "broadcast",
        event: "sync-response",
        payload: { target: payload.clientId, data: uint8ToBase64(stateUpdate) },
      });
    });

    channel.on("broadcast", { event: "sync-response" }, ({ payload }) => {
      if (destroyed || payload.target !== ydoc.clientID) return;
      if (!snapshotLoadedRef.current) return;
      try {
        Y.applyUpdate(ydoc, base64ToUint8(payload.data));
      } catch (e) {
        console.error("Sync response apply error:", e);
      }
    });

    channel.subscribe((status) => {
      if (destroyed) return;
      if (status === "SUBSCRIBED") {
        setConnectionState("connected");
        safeSend(channel, {
          type: "broadcast",
          event: "sync-request",
          payload: { clientId: ydoc.clientID },
        });
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        setConnectionState("disconnected");
      }
    });

    const cleanup = setInterval(() => {
      const now = Date.now();
      let changed = false;
      awarenessRef.current.forEach((state, id) => {
        if (now - state.lastSeen > 15000) {
          awarenessRef.current.delete(id);
          changed = true;
        }
      });
      if (changed) refreshCursorDecorations(editorRef.current);
    }, 5000);

    return () => {
      destroyed = true;
      clearInterval(cleanup);
      safeSend(channel, {
        type: "broadcast",
        event: "awareness",
        payload: {
          clientId: ydoc.clientID,
          state: { user: { name: userName, color: userColor }, cursor: null },
        },
      });
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [documentId, ydoc, supabase, userName, userColor, setConnectionState]);

  const broadcastAwareness = useCallback(
    (cursor: { anchor: number; head: number | null } | null) => {
      safeSend(channelRef.current, {
        type: "broadcast",
        event: "awareness",
        payload: {
          clientId: ydoc.clientID,
          state: { user: { name: userName, color: userColor }, cursor },
        },
      });
    },
    [ydoc.clientID, userName, userColor]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        undoRedo: false,
        codeBlock: false,
        link: false,
        underline: false,
      }),
      Collaboration.configure({
        document: ydoc,
        field: "default",
      }),
      CollaborationCursor.configure({
        awarenessStates: awarenessRef.current,
        localClientId: ydoc.clientID,
        user: { name: userName, color: userColor },
      }),
      Placeholder.configure({
        placeholder: "Start writing...",
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-cu-purple underline" },
      }),
      Image.configure({ inline: true }),
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      CodeBlockLowlight.configure({ lowlight }),
      currentWorkspaceId ? createMentionExtension() : null,
    ].filter(Boolean),
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[500px] px-8 py-6",
      },
    },
  });

  useEffect(() => {
    editorRef.current = editor;
    if (externalEditorRef) externalEditorRef.current = editor;
  }, [editor, externalEditorRef]);

  useEffect(() => {
    if (!editor) return;
    const onUpdate = () => { dirtyRef.current = true; };
    const onSelectionUpdate = () => {
      const { from, to } = editor.state.selection;
      broadcastAwareness(
        from === to ? { anchor: from, head: null } : { anchor: from, head: to }
      );
    };
    editor.on("update", onUpdate);
    editor.on("selectionUpdate", onSelectionUpdate);
    return () => {
      editor.off("update", onUpdate);
      editor.off("selectionUpdate", onSelectionUpdate);
    };
  }, [editor, broadcastAwareness]);

  useEffect(() => {
    const onUpdate = (_update: Uint8Array, origin: unknown) => {
      if (origin === "remote") return;
      safeSend(channelRef.current, {
        type: "broadcast",
        event: "yjs-update",
        payload: { data: uint8ToBase64(_update) },
      });
    };
    ydoc.on("update", onUpdate);
    return () => ydoc.off("update", onUpdate);
  }, [ydoc]);

  // Periodic save to Postgres (every 3s if dirty).
  useEffect(() => {
    if (!editor) return;
    const interval = setInterval(async () => {
      if (!dirtyRef.current) return;
      dirtyRef.current = false;
      try {
        const yjsSnapshot = `\\x${uint8ToHex(Y.encodeStateAsUpdate(ydoc))}`;
        await supabase
          .from("documents")
          .update({
            content: editor.getJSON(),
            yjs_snapshot: yjsSnapshot,
            updated_at: new Date().toISOString(),
          })
          .eq("id", documentId);
      } catch {
        dirtyRef.current = true;
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [editor, ydoc, documentId, supabase]);

  // Final save on unmount + destroy ydoc.
  useEffect(() => {
    return () => {
      if (snapshotLoadedRef.current && dirtyRef.current) {
        dirtyRef.current = false;
        try {
          const yjsSnapshot = `\\x${uint8ToHex(Y.encodeStateAsUpdate(ydoc))}`;
          const json = editorRef.current?.getJSON() ?? {};
          Promise.resolve(
            supabase
              .from("documents")
              .update({
                content: json,
                yjs_snapshot: yjsSnapshot,
                updated_at: new Date().toISOString(),
              })
              .eq("id", documentId)
          )
            .then(() => {})
            .catch(() => {});
        } catch (e) {
          console.error("Final save failed:", e);
        }
      }
      ydoc.destroy();
    };
  }, [ydoc, documentId, supabase]);

  const exportAsMarkdown = useCallback(async () => {
    if (!editor) return;
    const { default: turndown } = await import("turndown");
    const td = new turndown();
    const markdown = td.turndown(editor.getHTML());
    const blob = new Blob([markdown], { type: "text/markdown" });
    downloadBlob(blob, `${documentTitle || "document"}.md`);
  }, [editor, documentTitle]);

  const exportAsPDF = useCallback(() => {
    if (!editor) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${documentTitle || "Document"}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; line-height: 1.6; color: #0f172a; }
            h1, h2, h3 { font-family: 'Spline Sans', sans-serif; }
            table { border-collapse: collapse; width: 100%; }
            td, th { border: 1px solid #e2e8f0; padding: 8px; }
            pre { background: #f8fafc; padding: 16px; border-radius: 8px; overflow-x: auto; }
            code { background: #f1f5f9; padding: 2px 4px; border-radius: 4px; font-size: 0.9em; }
            ul[data-type="taskList"] { list-style: none; padding-left: 0; }
            ul[data-type="taskList"] li { display: flex; align-items: center; gap: 8px; }
          </style>
        </head>
        <body>${editor.getHTML()}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  }, [editor, documentTitle]);

  const exportAsHTML = useCallback(() => {
    if (!editor) return;
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${documentTitle || "Document"}</title>
  <style>
    body { font-family: 'Inter', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6; color: #0f172a; }
    h1, h2, h3 { font-family: 'Spline Sans', sans-serif; }
  </style>
</head>
<body>${editor.getHTML()}</body>
</html>`;
    const blob = new Blob([html], { type: "text/html" });
    downloadBlob(blob, `${documentTitle || "document"}.html`);
  }, [editor, documentTitle]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#ede9fe] border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Toolbar
        editor={editor}
        onExportMarkdown={exportAsMarkdown}
        onExportPDF={exportAsPDF}
        onExportHTML={exportAsHTML}
      />
      <div className="flex-1 overflow-y-auto bg-white border border-slate-100 rounded-b-2xl shadow-sm">
        <div className="px-8 pt-4">
          <input
            value={documentTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Untitled Document"
            className="w-full text-[32px] font-['Spline_Sans',sans-serif] font-bold text-slate-900 tracking-[-0.8px] border-none outline-none bg-transparent placeholder:text-slate-300"
          />
        </div>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}