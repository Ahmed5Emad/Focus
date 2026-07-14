import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: reminders } = await supabase
      .from("due_date_reminders")
      .select("*, tasks!due_date_reminders_task_id_fkey(title, workspace_id)")
      .lte("reminder_at", new Date().toISOString())
      .eq("sent", false);

    if (!reminders || reminders.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const reminderIds: string[] = [];

    for (const reminder of reminders) {
      await supabase.from("notifications").insert({
        user_id: reminder.user_id,
        workspace_id: (reminder.tasks as Record<string, unknown>).workspace_id as string,
        type: "session_reminder",
        title: "Task due date approaching",
        body: `"${(reminder.tasks as Record<string, unknown>).title}" is due soon`,
        link: "/tasks",
      });

      reminderIds.push(reminder.id);
    }

    await supabase
      .from("due_date_reminders")
      .update({ sent: true })
      .in("id", reminderIds);

    return new Response(
      JSON.stringify({ processed: reminderIds.length }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
