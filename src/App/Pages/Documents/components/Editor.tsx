import { useCallback, useEffect, useMemo, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
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

interface EditorProps {
  documentId: string;
  documentTitle: string;
  onTitleChange: (title: string) => void;
}

export function Editor({ documentId, documentTitle, onTitleChange }: EditorProps) {
  const { user } = useAuth();
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Anonymous";
  const userColorIndex = user ? hashUserId(user.id) % USER_COLORS.length : 0;
  const userColor = USER_COLORS[userColorIndex];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ydoc = useMemo(() => new Y.Doc(), [documentId]);
  const dirtyRef = useRef(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel>>(null!);
  const awarenessRef = useRef<Map<number, AwarenessState>>(new Map());

  useEffect(() => {
    let destroyed = false;

    supabase
      .from("documents")
      .select("yjs_snapshot")
      .eq("id", documentId)
      .single()
      .then(({ data }) => {
        if (destroyed || !data?.yjs_snapshot) return;
        try {
          Y.applyUpdate(ydoc, hexToUint8(data.yjs_snapshot as string));
        } catch (e) {
          console.error("Failed to load Yjs snapshot, starting fresh document:", e);
        }
      });

    const channel = supabase.channel(`document-${documentId}`);

    channel.on("broadcast", { event: "yjs-update" }, ({ payload }) => {
      if (destroyed) return;
      try {
        Y.applyUpdate(ydoc, base64ToUint8(payload.data));
      } catch (e) {
        console.error("Remote sync error:", e);
      }
    });

    channel.on("broadcast", { event: "awareness" }, ({ payload }) => {
      if (destroyed || payload.clientId === ydoc.clientID) return;
      awarenessRef.current.set(payload.clientId, { ...payload.state, lastSeen: Date.now() });
    });

    channel.subscribe();
    channelRef.current = channel;

    const cleanup = setInterval(() => {
      const now = Date.now();
      awarenessRef.current.forEach((state, id) => {
        if (now - state.lastSeen > 10000) {
          awarenessRef.current.delete(id);
        }
      });
    }, 10000);

    return () => {
      destroyed = true;
      clearInterval(cleanup);
      supabase.removeChannel(channel);
    };
  }, [documentId, ydoc, supabase]);

  const broadcastAwareness = useCallback(
    (cursor: { anchor: number; head: number | null } | null) => {
      channelRef.current?.send({
        type: "broadcast",
        event: "awareness",
        payload: {
          clientId: ydoc.clientID,
          state: {
            user: { name: userName, color: userColor },
            cursor,
          },
        },
      });
    },
    [ydoc, userName, userColor]
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
    ],
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[500px] px-8 py-6",
      },
    },
  });

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
      channelRef.current?.send({
        type: "broadcast",
        event: "yjs-update",
        payload: { data: uint8ToBase64(_update) },
      });
    };
    ydoc.on("update", onUpdate);
    return () => ydoc.off("update", onUpdate);
  }, [ydoc]);

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

  useEffect(() => {
    return () => {
      ydoc.destroy();
    };
  }, [ydoc]);

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
