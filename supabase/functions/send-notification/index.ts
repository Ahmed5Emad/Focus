import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const { notification_id } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: notification } = await supabase
      .from("notifications")
      .select("*, auth.users!notifications_user_id_fkey(email)")
      .eq("id", notification_id)
      .single();

    if (!notification) {
      return new Response(JSON.stringify({ error: "Notification not found" }), { status: 404 });
    }

    const userEmail = notification.users?.email;
    if (!userEmail) {
      return new Response(JSON.stringify({ error: "User has no email" }), { status: 400 });
    }

    console.log(`Sending email to ${userEmail}: ${notification.title}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
