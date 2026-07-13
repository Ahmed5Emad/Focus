import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Document {
  id: string;
  workspace_id: string;
  title: string;
  content: Record<string, unknown>;
  created_by: string;
  created_at: string;
  updated_at: string;
  project_id: string;
  task_id: string | null;
  tasks?: { title: string } | null;
}

export function useDocuments() {
  const { user, currentWorkspaceId } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    if (!currentWorkspaceId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*, tasks(title)")
        .eq("workspace_id", currentWorkspaceId)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspaceId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    if (!currentWorkspaceId) return;

    const channel = supabase
      .channel(`documents-${currentWorkspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "documents",
          filter: `workspace_id=eq.${currentWorkspaceId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setDocuments((prev) => [payload.new as Document, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setDocuments((prev) =>
              prev.map((d) =>
                d.id === payload.new.id
                  ? { ...d, ...(payload.new as Document) }
                  : d
              )
            );
          } else if (payload.eventType === "DELETE") {
            setDocuments((prev) => prev.filter((d) => d.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentWorkspaceId]);

  const createDocument = async (projectId: string, title?: string, taskId?: string | null) => {
    if (!currentWorkspaceId || !user) return null;

    try {
      const { data, error } = await supabase
        .from("documents")
        .insert({
          workspace_id: currentWorkspaceId,
          title: title || "Untitled Document",
          created_by: user.id,
          project_id: projectId,
          task_id: taskId ?? null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Document;
    } catch (error) {
      console.error("Error creating document:", error);
      return null;
    }
  };

  const updateDocument = async (id: string, updates: Partial<Document>) => {
    try {
      const { error } = await supabase
        .from("documents")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      setDocuments((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
      );
      return true;
    } catch (error) {
      console.error("Error updating document:", error);
      return false;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      return true;
    } catch (error) {
      console.error("Error deleting document:", error);
      return false;
    }
  };

  return {
    documents,
    isLoading,
    createDocument,
    updateDocument,
    deleteDocument,
    refresh: fetchDocuments,
  };
}
