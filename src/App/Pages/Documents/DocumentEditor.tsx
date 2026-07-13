import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  const mountedRef = useRef(true);
  const titleSaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

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
        <div className="w-8 h-8 border-2 border-[#ede9fe] border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="page-container pt-6">
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Document not found</h2>
          <p className="text-slate-500 mb-6">This document doesn't exist or you don't have access.</p>
          <Button onClick={() => navigate("/documents")} className="btn-primary">
            Back to Documents
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container pt-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/documents")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Documents
        </Button>

        <div className="flex items-center gap-3">
          <TaskLinkSelector
            documentId={id!}
            currentTaskId={taskId}
            onTaskChange={setTaskId}
          />
          <Button
            variant="ghost"
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 ${
              showComments
                ? "text-primary bg-[#ede9fe]"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Comments
          </Button>
          <span className="text-xs text-slate-400 italic">
            Collaborators will see changes in real-time
          </span>
          {connection === "connected" ? (
            <div
              className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium"
              title="Realtime sync active"
            >
              <Wifi className="w-3.5 h-3.5 text-emerald-500" />
              <span>Synced</span>
            </div>
          ) : connection === "connecting" ? (
            <div
              className="flex items-center gap-1.5 text-xs text-amber-600 font-medium"
              title="Connecting to realtime channel..."
            >
              <Wifi className="w-3.5 h-3.5 animate-pulse text-amber-500" />
              <span>Connecting...</span>
            </div>
          ) : (
            <div
              className="flex items-center gap-1.5 text-xs text-rose-600 font-medium"
              title="Realtime connection lost. Edits will sync on reconnect."
            >
              <WifiOff className="w-3.5 h-3.5 text-rose-500" />
              <span>Offline</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            {saveState === "saving" ? (
              <>
                <Cloud className="w-3.5 h-3.5 animate-pulse text-primary" />
                <span className="text-primary font-medium">Saving...</span>
              </>
            ) : saveState === "unsaved" ? (
              <>
                <CloudOff className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-amber-600 font-medium">Unsaved</span>
              </>
            ) : (
              <>
                <Cloud className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 font-medium">Saved</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          <Editor
            documentId={id!}
            documentTitle={title}
            onTitleChange={setTitle}
            onConnectionChange={setConnection}
          />
        </div>
        {showComments && (
          <CommentSidebar
            documentId={id!}
            open={showComments}
            onOpenChange={setShowComments}
          />
        )}
      </div>
    </div>
  );
}
