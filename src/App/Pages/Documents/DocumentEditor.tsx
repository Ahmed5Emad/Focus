import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Editor as TiptapEditor } from "@tiptap/react";
import { ArrowLeft, Cloud, CloudOff, MessageSquare, Wifi, WifiOff } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Editor, type ConnectionStatus } from "./components/Editor";
import { TaskLinkSelector } from "./components/TaskLinkSelector";
import { CommentSidebar } from "./components/CommentSidebar";

export default function DocumentEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState("Untitled Document");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "unsaved">("saved");
  const [showComments, setShowComments] = useState(false);
  const [connection, setConnection] = useState<ConnectionStatus>("connecting");
  const editorRef = useRef<TiptapEditor | null>(null);
  const mountedRef = useRef(true);
  const titleSaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (id) sessionStorage.setItem("lastDocumentId", id);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const fetchDocument = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("documents")
          .select("title, task_id")
          .eq("id", id)
          .single();
        if (cancelled) return;
        if (error) {
          setNotFound(true);
          return;
        }
        setTitle(data.title);
        setTaskId(data.task_id);
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchDocument();
    return () => { cancelled = true; };
  }, [id]);

  const lastSavedTitle = useRef(title);

  useEffect(() => {
    if (!id || loading) return;
    if (titleSaveTimer.current) clearTimeout(titleSaveTimer.current);

    titleSaveTimer.current = setTimeout(async () => {
      if (!mountedRef.current) return;
      lastSavedTitle.current = title;
      setSaveState("saving");
      try {
        await supabase
          .from("documents")
          .update({ title, updated_at: new Date().toISOString() })
          .eq("id", id);
        if (mountedRef.current) setSaveState("saved");
      } catch {
        if (mountedRef.current) setSaveState("unsaved");
      }
    }, 800);

    return () => {
      if (titleSaveTimer.current) {
        clearTimeout(titleSaveTimer.current);
        titleSaveTimer.current = undefined;
      }
      if (lastSavedTitle.current !== title) {
        Promise.resolve(
          supabase
            .from("documents")
            .update({ title, updated_at: new Date().toISOString() })
            .eq("id", id)
        ).then(() => { lastSavedTitle.current = title; }).catch(() => {});
      }
    };
  }, [title, id, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="page-container pt-6">
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-bold text-foreground mb-2">Document not found</h2>
          <p className="text-muted-foreground mb-6">This document doesn't exist or you don't have access.</p>
          <Button onClick={() => { sessionStorage.removeItem("lastDocumentId"); navigate("/documents"); }} className="btn-primary">
            Back to Documents
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full pt-2 sm:pt-4 pb-4 sm:pb-6">
      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-3 shrink-0">
        <Button
          variant="ghost"
          onClick={() => { sessionStorage.removeItem("lastDocumentId"); navigate("/documents"); }}
          className="flex items-center gap-1 sm:gap-2 text-muted-foreground hover:text-foreground shrink-0 px-1 sm:px-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Documents</span>
        </Button>

        <div className="flex items-center gap-1 sm:gap-2 ml-auto min-w-0 flex-shrink flex-nowrap overflow-x-auto scrollbar-none">
          <TaskLinkSelector
            documentId={id!}
            currentTaskId={taskId}
            onTaskChange={setTaskId}
          />
          <Button
            variant="ghost"
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1 sm:gap-2 shrink-0 ${
              showComments
                ? "text-primary bg-cu-purple/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Comments</span>
          </Button>
          <span className="hidden sm:inline text-xs text-muted-foreground italic whitespace-nowrap">
            Collaborators will see changes in real-time
          </span>
          {connection === "connected" ? (
            <div
              className="flex items-center gap-1 sm:gap-1.5 text-xs text-emerald-600 font-medium shrink-0"
              title="Realtime sync active"
            >
              <Wifi className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">Synced</span>
            </div>
          ) : connection === "connecting" ? (
            <div
              className="flex items-center gap-1 sm:gap-1.5 text-xs text-amber-600 font-medium shrink-0"
              title="Connecting to realtime channel..."
            >
              <Wifi className="w-3.5 h-3.5 animate-pulse text-amber-500" />
              <span className="hidden sm:inline">Connecting...</span>
            </div>
          ) : (
            <div
              className="flex items-center gap-1 sm:gap-1.5 text-xs text-rose-600 font-medium shrink-0"
              title="Realtime connection lost. Edits will sync on reconnect."
            >
              <WifiOff className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden sm:inline">Offline</span>
            </div>
          )}
          <div className="flex items-center gap-1 sm:gap-1.5 text-xs text-muted-foreground shrink-0">
            {saveState === "saving" ? (
              <>
                <Cloud className="w-3.5 h-3.5 animate-pulse text-primary" />
                <span className="hidden sm:inline text-primary font-medium">Saving...</span>
              </>
            ) : saveState === "unsaved" ? (
              <>
                <CloudOff className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline text-amber-600 font-medium">Unsaved</span>
              </>
            ) : (
              <>
                <Cloud className="w-3.5 h-3.5 text-emerald-500" />
                <span className="hidden sm:inline text-emerald-600 font-medium">Saved</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row lg:gap-4">
        <div className="flex-1 min-h-0 min-w-0">
          <Editor
            documentId={id!}
            documentTitle={title}
            onTitleChange={setTitle}
            onConnectionChange={setConnection}
            editorRef={editorRef}
          />
        </div>

        {showComments && (
          <>
            <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setShowComments(false)} />
            <div className="fixed right-0 top-0 bottom-0 w-80 z-50 lg:relative lg:top-auto lg:bottom-auto lg:w-80 lg:z-auto lg:shrink-0 lg:h-full lg:min-h-0">
              <CommentSidebar
                documentId={id!}
                open={showComments}
                onOpenChange={setShowComments}
                editorRef={editorRef}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
