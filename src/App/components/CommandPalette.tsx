import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ListChecks, Layout, Trophy, Search } from "lucide-react";
import { Command as CommandPrimitive } from "cmdk";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  CommandDialog,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchItem {
  id: string;
  title: string;
  type: "task" | "goal" | "project" | "document";
  url: string;
}

const typeConfig = {
  task: { icon: ListChecks, color: "text-[#7b68ee]", bg: "bg-[#7b68ee]/10", label: "Task" },
  goal: { icon: Trophy, color: "text-amber-600", bg: "bg-amber-50", label: "Goal" },
  project: { icon: Layout, color: "text-emerald-600", bg: "bg-emerald-50", label: "Project" },
  document: { icon: FileText, color: "text-sky-600", bg: "bg-sky-50", label: "Document" },
};

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { currentWorkspaceId } = useAuth();
  const [supabase] = useState(() => createClient());
  const [items, setItems] = useState<SearchItem[]>([]);

  useEffect(() => {
    if (!open || !currentWorkspaceId) return;

    const fetchItems = async () => {
      const [tasksRes, goalsRes, projectsRes, docsRes] = await Promise.all([
        supabase.from("tasks").select("id, title").eq("workspace_id", currentWorkspaceId).limit(20),
        supabase.from("goals").select("id, title").eq("workspace_id", currentWorkspaceId).limit(20),
        supabase.from("projects").select("id, title").eq("workspace_id", currentWorkspaceId).limit(20),
        supabase.from("documents").select("id, title").eq("workspace_id", currentWorkspaceId).limit(20),
      ]);

      setItems([
        ...(tasksRes.data?.map((t) => ({ id: t.id, title: t.title, type: "task" as const, url: "/tasks" })) ?? []),
        ...(goalsRes.data?.map((g) => ({ id: g.id, title: g.title, type: "goal" as const, url: "/goals" })) ?? []),
        ...(projectsRes.data?.map((p) => ({ id: p.id, title: p.title, type: "project" as const, url: "/projects" })) ?? []),
        ...(docsRes.data?.map((d) => ({ id: d.id, title: d.title, type: "document" as const, url: `/documents/${d.id}` })) ?? []),
      ]);
    };

    fetchItems();
  }, [open, currentWorkspaceId, supabase]);

  const handleSelect = (item: SearchItem) => {
    onOpenChange(false);
    navigate(item.url);
  };

  const taskItems = items.filter((i) => i.type === "task");
  const goalItems = items.filter((i) => i.type === "goal");
  const projectItems = items.filter((i) => i.type === "project");
  const documentItems = items.filter((i) => i.type === "document");

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      className="rounded-xl shadow-2xl border border-slate-200/80 p-0 gap-0 bg-white/95 backdrop-blur-sm sm:max-w-[600px]"
      showCloseButton={false}
    >
      <div className="flex items-center gap-2 border-b border-slate-100 px-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <CommandPrimitive.Input
          placeholder="Search anything..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 py-3"
        />
      </div>

      <CommandList className="max-h-[300px] px-2 py-1">
        <CommandEmpty>
          <div className="flex flex-col items-center py-12">
            <Search className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-sm text-slate-500">No results found</p>
          </div>
        </CommandEmpty>

        {taskItems.length > 0 && (
          <CommandGroup heading={<span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1 py-1.5">Tasks</span>}>
            {taskItems.map((item) => {
              const c = typeConfig.task;
              return (
                <CommandItem key={`task-${item.id}`} value={`task-${item.id}`} onSelect={() => handleSelect(item)} className="flex items-center gap-3 py-3 px-3 rounded-xl cursor-pointer aria-selected:bg-slate-100 transition-colors">
                  <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
                    <c.icon className={`w-5 h-5 ${c.color}`} />
                  </div>
                  <span className="flex-1 text-sm font-medium text-slate-700 truncate">{item.title}</span>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${c.color} opacity-60`}>{c.label}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {goalItems.length > 0 && (
          <CommandGroup heading={<span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1 py-1.5">Goals</span>}>
            {goalItems.map((item) => {
              const c = typeConfig.goal;
              return (
                <CommandItem key={`goal-${item.id}`} value={`goal-${item.id}`} onSelect={() => handleSelect(item)} className="flex items-center gap-3 py-3 px-3 rounded-xl cursor-pointer aria-selected:bg-slate-100 transition-colors">
                  <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
                    <c.icon className={`w-5 h-5 ${c.color}`} />
                  </div>
                  <span className="flex-1 text-sm font-medium text-slate-700 truncate">{item.title}</span>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${c.color} opacity-60`}>{c.label}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {projectItems.length > 0 && (
          <CommandGroup heading={<span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1 py-1.5">Projects</span>}>
            {projectItems.map((item) => {
              const c = typeConfig.project;
              return (
                <CommandItem key={`project-${item.id}`} value={`project-${item.id}`} onSelect={() => handleSelect(item)} className="flex items-center gap-3 py-3 px-3 rounded-xl cursor-pointer aria-selected:bg-slate-100 transition-colors">
                  <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
                    <c.icon className={`w-5 h-5 ${c.color}`} />
                  </div>
                  <span className="flex-1 text-sm font-medium text-slate-700 truncate">{item.title}</span>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${c.color} opacity-60`}>{c.label}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {documentItems.length > 0 && (
          <CommandGroup heading={<span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1 py-1.5">Documents</span>}>
            {documentItems.map((item) => {
              const c = typeConfig.document;
              return (
                <CommandItem key={`document-${item.id}`} value={`document-${item.id}`} onSelect={() => handleSelect(item)} className="flex items-center gap-3 py-3 px-3 rounded-xl cursor-pointer aria-selected:bg-slate-100 transition-colors">
                  <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
                    <c.icon className={`w-5 h-5 ${c.color}`} />
                  </div>
                  <span className="flex-1 text-sm font-medium text-slate-700 truncate">{item.title}</span>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${c.color} opacity-60`}>{c.label}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>

      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-medium shadow-sm">↑↓</kbd>
            <span className="ml-1">navigate</span>
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-medium shadow-sm">↵</kbd>
            <span className="ml-1">open</span>
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-medium shadow-sm">esc</kbd>
            <span className="ml-1">close</span>
          </span>
        </div>
        <span className="text-[11px] font-medium text-slate-400">{items.length} results</span>
      </div>
    </CommandDialog>
  );
}
