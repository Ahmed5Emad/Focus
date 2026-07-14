import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "notifications@focus.app";

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

    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("email_notifications")
      .eq("user_id", notification.user_id)
      .single();

    if (prefs && !prefs.email_notifications) {
      return new Response(JSON.stringify({ skipped: true, reason: "email notifications disabled" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!RESEND_API_KEY) {
      console.log(`[mock] Sending email to ${userEmail}: ${notification.title}`);
      return new Response(JSON.stringify({ success: true, mock: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [userEmail],
        subject: notification.title,
        html: `<p>${notification.body ?? ""}</p><p><a href="${notification.link ?? ""}">View in Focus</a></p>`,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Resend API error:", errBody);
      return new Response(JSON.stringify({ error: "Failed to send email" }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
