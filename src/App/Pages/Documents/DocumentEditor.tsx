import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Cloud, CloudOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Editor } from "./components/Editor";
import { TaskLinkSelector } from "./components/TaskLinkSelector";

export default function DocumentEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [supabase] = useState(() => createClient());
  const [title, setTitle] = useState("Untitled Document");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "unsaved">("saved");
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!id) return;
    const fetchDocument = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("documents")
          .select("title, task_id")
          .eq("id", id)
          .single();
        if (error) {
          setNotFound(true);
          return;
        }
        setTitle(data.title);
        setTaskId(data.task_id);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchDocument();
  }, [id, supabase]);

  useEffect(() => {
    if (!id || loading) return;
    setSaveState("unsaved");

    if (saveTimer.current) clearTimeout(saveTimer.current);

    saveTimer.current = setTimeout(async () => {
      setSaveState("saving");
      try {
        await supabase
          .from("documents")
          .update({ title, updated_at: new Date().toISOString() })
          .eq("id", id);
        setSaveState("saved");
      } catch {
        setSaveState("unsaved");
      }
    }, 800);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [title, id, supabase, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#ede9fe] border-t-[#7b68ee] rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="page-container pt-6">
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-bold text-[#0f172a] mb-2">Document not found</h2>
          <p className="text-[#64748b] mb-6">This document doesn't exist or you don't have access.</p>
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
          className="flex items-center gap-2 text-[#64748b] hover:text-[#0f172a]"
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
          <span className="text-xs text-[#94a3b8] italic">
            Collaborators will see changes in real-time
          </span>
          <div className="flex items-center gap-1.5 text-xs text-[#94a3b8]">
            {saveState === "saving" ? (
              <>
                <Cloud className="w-3.5 h-3.5 animate-pulse text-[#7b68ee]" />
                <span className="text-[#7b68ee] font-medium">Saving...</span>
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

      <div className="flex-1 flex flex-col min-h-0">
        <Editor
          documentId={id!}
          documentTitle={title}
          onTitleChange={setTitle}
        />
      </div>
    </div>
  );
}
