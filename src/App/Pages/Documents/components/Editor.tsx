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
import { HocuspocusProvider } from "@hocuspocus/provider";
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

interface EditorProps {
  documentId: string;
  documentTitle: string;
  onTitleChange: (title: string) => void;
}

export function Editor({ documentId, documentTitle, onTitleChange }: EditorProps) {
  const { user, session } = useAuth();

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Anonymous";
  const userColorIndex = user ? hashUserId(user.id) % USER_COLORS.length : 0;
  const userColor = USER_COLORS[userColorIndex];

  const token = session?.access_token || "";

  const ydoc = useMemo(() => new Y.Doc(), [documentId]);

  const provider = useMemo(() => {
    if (!token) return null;
    return new HocuspocusProvider({
      url: import.meta.env.VITE_HOCUSPOCUS_URL || "ws://localhost:1234",
      name: documentId,
      document: ydoc,
      token,
    });
  }, [token, documentId, ydoc]);

  const supabaseRef = useRef(createClient());
  const dirtyRef = useRef(false);

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
      }),
      provider && CollaborationCursor.configure({
        provider,
        user: {
          name: userName,
          color: userColor,
        },
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
    ].filter((e): e is NonNullable<typeof e> => e != null),
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[500px] px-8 py-6",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const fragment = ydoc.getXmlFragment("default");
    if (fragment.length > 0) return;
    supabaseRef.current
      .from("documents")
      .select("content")
      .eq("id", documentId)
      .single()
      .then(({ data }) => {
        if (fragment.length > 0) return;
        if (data?.content && typeof data.content === "object" && Object.keys(data.content).length > 0) {
          editor.commands.setContent(data.content);
        }
      });
  }, [editor, ydoc, documentId]);

  useEffect(() => {
    const onUpdate = () => { dirtyRef.current = true; };
    ydoc.on("update", onUpdate);
    return () => { ydoc.off("update", onUpdate); };
  }, [ydoc]);

  useEffect(() => {
    if (!token || !editor) return;
    const interval = setInterval(async () => {
      if (!dirtyRef.current) return;
      dirtyRef.current = false;
      try {
        await supabaseRef.current
          .from("documents")
          .update({
            content: editor.getJSON(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", documentId);
      } catch (err) {
        console.error("Auto-save failed:", err);
        dirtyRef.current = true;
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [token, editor, documentId]);

  useEffect(() => {
    return () => {
      provider?.disconnect();
      provider?.destroy();
      ydoc.destroy();
    };
  }, [provider, ydoc]);

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
        <div className="w-8 h-8 border-2 border-[#ede9fe] border-t-[#7b68ee] rounded-full animate-spin" />
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
      <div className="flex-1 overflow-y-auto bg-white border border-[#f1f5f9] rounded-b-2xl shadow-sm">
        <div className="px-8 pt-4">
          <input
            value={documentTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Untitled Document"
            className="w-full text-[32px] font-['Spline_Sans',sans-serif] font-bold text-[#0f172a] tracking-[-0.8px] border-none outline-none bg-transparent placeholder:text-[#cbd5e1]"
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
