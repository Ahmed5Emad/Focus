import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FileText, Plus, MoreHorizontal, Trash2, Edit,
  Clock, User, FolderOpen,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useDocuments } from "@/hooks/useDocuments";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface ProjectRef {
  id: string;
  title: string;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export default function Documents() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { documents, isLoading, createDocument, deleteDocument, updateDocument } = useDocuments();
  const [projects, setProjects] = useState<ProjectRef[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    const lastDocId = sessionStorage.getItem("lastDocumentId");
    if (lastDocId) {
      sessionStorage.removeItem("lastDocumentId");
      navigate(`/documents/${lastDocId}`, { replace: true });
    }
  }, [navigate]);

  const projectFilter = searchParams.get("project");
  const selectedProject = projectFilter ?? "all";

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("projects")
      .select("id, title")
      .order("title")
      .then(({ data }) => setProjects(data ?? []));
  }, []);

  const projectMap = new Map(projects.map((p) => [p.id, p.title]));

  const docsByProject = documents.reduce<Map<string, typeof documents>>((acc, doc) => {
    const key = doc.project_id;
    if (!acc.has(key)) acc.set(key, []);
    acc.get(key)!.push(doc);
    return acc;
  }, new Map());

  const filteredProjects = selectedProject === "all"
    ? [...docsByProject.entries()]
    : [[selectedProject, docsByProject.get(selectedProject) ?? []]] as [string, typeof documents][];

  const handleCreate = async (projectId?: string) => {
    const pid = projectId ?? projects[0]?.id;
    if (!pid) return;
    const doc = await createDocument(pid);
    if (doc) navigate(`/documents/${doc.id}`);
  };

  const handleRename = async (id: string) => {
    if (editingTitle.trim()) {
      await updateDocument(id, { title: editingTitle.trim() });
    }
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    const ok = await deleteDocument(deleteTarget);
    setDeleteTarget(null);
    if (ok) {
      toast.success("Document deleted");
    } else {
      toast.error("Failed to delete document");
      setDeleteError("Failed to delete document. You may not have permission, or the document may no longer exist.");
    }
  };

  return (
    <>
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        onConfirm={confirmDelete}
        title="Delete Document"
        description="Are you sure you want to delete this document? This cannot be undone."
        confirmLabel="Delete"
        destructive
      />
      <div className="page-container pt-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-3">
        <div>
          <h1 className="page-title mb-2">Documents</h1>
          <p className="page-description">
            Create and collaborate on documents organized by project.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="btn-primary">
                <Plus className="w-4 h-4" />
                New Document
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              {projects.map((p) => (
                <DropdownMenuItem
                  key={p.id}
                  className="cursor-pointer"
                  onClick={() => handleCreate(p.id)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  In "{p.title}"
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {deleteError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          {deleteError}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="content-card p-4 flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-4 w-48" />
                <div className="flex items-center gap-3 mt-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded-md shrink-0" />
            </div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Create your first document to start collaborating with your team."
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="btn-primary">
                <Plus className="w-4 h-4" />
                Create Document
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              {projects.map((p) => (
                <DropdownMenuItem
                  key={p.id}
                  className="cursor-pointer"
                  onClick={() => handleCreate(p.id)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  In "{p.title}"
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </EmptyState>
      ) : (
        <div className="space-y-8">
          {filteredProjects.length === 0 && selectedProject !== "all" && (
            <EmptyState
              icon={FileText}
              title="No documents in this project"
              description="Create a document in this project to get started."
            >
              <Button className="btn-primary" onClick={() => handleCreate(selectedProject)}>
                <Plus className="w-4 h-4" />
                Create Document
              </Button>
            </EmptyState>
          )}

          {filteredProjects.map(([projectId, docs]) => {
            const projectName = projectMap.get(projectId) ?? "Unknown Project";
            return (
              <section key={projectId}>
                <div className="flex items-center gap-2 mb-3">
                  <FolderOpen className="w-5 h-5 text-primary" />
                  <h3 className="font-['Spline_Sans',sans-serif] text-lg font-semibold text-slate-900">
                    {projectName}
                  </h3>
                  <button
                    onClick={() => handleCreate(projectId)}
                    className="ml-1 p-1 rounded-md text-slate-400 hover:text-primary hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    title="Add document to this project"
                    aria-label={`Add document to ${projectName}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid gap-2">
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="content-card p-4 flex items-center gap-4 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
                      onClick={() => navigate(`/documents/${doc.id}`)}
                    >
                      <div className="w-10 h-10 bg-[#f5f3ff] rounded-xl flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        {editingId === doc.id ? (
                          <input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onBlur={() => handleRename(doc.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleRename(doc.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            className="text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded px-2 py-1 w-full outline-none focus:border-primary"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <h3 className="text-sm font-semibold text-slate-900 truncate">
                            {doc.title}
                          </h3>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Clock className="w-3 h-3" />
                            {formatDate(doc.updated_at)}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-slate-400">
                            <User className="w-3 h-3" />
                            {doc.created_by === user?.id ? "You" : "Collaborator"}
                          </span>
                          {doc.task_id && doc.tasks?.title && (
                            <span className="flex items-center gap-1 text-[11px] text-primary truncate max-w-[150px]">
                              <FileText className="w-3 h-3 shrink-0" />
                              <span className="truncate">{doc.tasks.title}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-md text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            aria-label="Document actions"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 rounded-lg">
                          <DropdownMenuItem
                            className="cursor-pointer text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingId(doc.id);
                              setEditingTitle(doc.title);
                            }}
                          >
                            <Edit className="w-3.5 h-3.5 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer text-sm text-red-600 focus:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(doc.id);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
    </>
  );
}
