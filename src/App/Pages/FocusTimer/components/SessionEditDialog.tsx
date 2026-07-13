import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Folder } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dropdown } from "@/components/shared/Dropdown";
import { DatePicker } from "@/components/ui/date-picker";

interface TaskOption {
  id: string;
  title: string;
}

interface SessionEditDialogProps {
  session: {
    id: string;
    task_id: string | null;
    status: string;
    actual_duration_seconds: number;
    start_time: string;
    tasks?: { title: string } | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (sessionId: string, updates: { task_id: string | null; status: string; actual_duration_seconds: number }) => Promise<boolean>;
}

export function SessionEditDialog({ session, open, onOpenChange, onSave }: SessionEditDialogProps) {
  const { currentWorkspaceId } = useAuth();
  const [supabase] = useState(() => createClient());

  const [taskId, setTaskId] = useState<string | null>(session?.task_id ?? null);
  const [status, setStatus] = useState(session?.status ?? "completed");
  const [durationMinutes, setDurationMinutes] = useState(
    session ? Math.floor(session.actual_duration_seconds / 60) : 0
  );
  const [sessionDate, setSessionDate] = useState<Date | undefined>(
    session?.start_time ? new Date(session.start_time) : undefined
  );
  const [tasks, setTasks] = useState<TaskOption[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!currentWorkspaceId) return;
    const fetchTasks = async () => {
      try {
        const { data } = await supabase
          .from("tasks")
          .select("id, title")
          .eq("workspace_id", currentWorkspaceId)
          .order("created_at", { ascending: false });
        setTasks(data ?? []);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, [currentWorkspaceId, supabase]);

  const handleSave = async () => {
    if (!session || isSaving) return;
    setIsSaving(true);

    const success = await onSave(session.id, {
      task_id: taskId,
      status,
      actual_duration_seconds: durationMinutes * 60,
    });
    setIsSaving(false);
    if (success) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent key={session?.id ?? "edit"} className="sm:max-w-lg rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-['Spline_Sans',sans-serif] text-lg">Edit Session</DialogTitle>
          <DialogDescription>Update the session details below.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">Task</label>
            <Dropdown
              value={taskId}
              onValueChange={setTaskId}
              options={tasks.map((t) => ({ value: t.id, label: t.title }))}
              placeholder="No Task"
              searchPlaceholder="Search tasks..."
              emptyText="No task found."
              noneLabel="No Task"
              icon={<Folder className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">Status</label>
              <Dropdown
                value={status}
                onValueChange={(val) => setStatus(val ?? "completed")}
                options={[
                  { value: "completed", label: "Completed" },
                  { value: "abandoned", label: "Abandoned" },
                ]}
                showSearch={false}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">Date</label>
              <DatePicker
                value={sessionDate}
                onChange={setSessionDate}
                placeholder="Pick a date"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">Duration (minutes)</label>
            <input
              type="number"
              min={0}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 outline-none transition-all text-slate-700"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="h-9 px-4 rounded-lg text-slate-500"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="h-9 px-5 rounded-lg bg-primary hover:opacity-90 text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
