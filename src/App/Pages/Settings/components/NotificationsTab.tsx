import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Bell, Loader2 } from 'lucide-react';
import { Dropdown } from '@/components/shared/Dropdown';
import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsTab() {
  const { user } = useAuth();
  const [notifPrefs, setNotifPrefs] = useState<{ email_notifications: boolean; push_notifications: boolean; digest_frequency: string } | null>(null);
  const [notifPrefsLoading, setNotifPrefsLoading] = useState(false);
  const [notifPrefsSaving, setNotifPrefsSaving] = useState(false);

  const fetchNotifPrefs = async () => {
    if (!user) return;
    setNotifPrefsLoading(true);
    try {
      const { data } = await supabase
        .from("notification_preferences")
        .select("email_notifications, push_notifications, digest_frequency")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setNotifPrefs(data);
      } else {
        setNotifPrefs({ email_notifications: true, push_notifications: false, digest_frequency: "instant" });
      }
    } catch {
      setNotifPrefs({ email_notifications: true, push_notifications: false, digest_frequency: "instant" });
    } finally {
      setNotifPrefsLoading(false);
    }
  };

  const saveNotifPrefs = async (updates: Partial<typeof notifPrefs>) => {
    if (!user || !notifPrefs) return;
    setNotifPrefsSaving(true);
    try {
      const merged = { ...notifPrefs, ...updates };
      const { error } = await supabase
        .from("notification_preferences")
        .upsert({ user_id: user.id, ...merged, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
      if (error) throw error;
      setNotifPrefs(merged);
    } catch (error) {
      console.error("Failed to save notification preferences:", error);
    } finally {
      setNotifPrefsSaving(false);
    }
  };

  useEffect(() => {
    if (user) fetchNotifPrefs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card rounded-xl p-6 shadow-sm border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#f5f3ff] flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Email & Push Notifications</h3>
            <p className="text-sm text-muted-foreground">Control how and when you receive notifications.</p>
          </div>
        </div>

        {notifPrefsLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        ) : notifPrefs ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email notifications</p>
                <p className="text-xs text-muted-foreground">Receive notifications via email.</p>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={notifPrefs.email_notifications} onChange={(e) => saveNotifPrefs({ email_notifications: e.target.checked })} className="rounded border-input text-primary focus:ring-primary" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Push notifications</p>
                <p className="text-xs text-muted-foreground">Receive push notifications in-app.</p>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={notifPrefs.push_notifications} onChange={(e) => saveNotifPrefs({ push_notifications: e.target.checked })} className="rounded border-input text-primary focus:ring-primary" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Digest frequency</p>
                <p className="text-xs text-muted-foreground">How often to receive digest emails.</p>
              </div>
              <Dropdown
                value={notifPrefs.digest_frequency}
                onValueChange={(val) => val && saveNotifPrefs({ digest_frequency: val })}
                options={[
                  { value: "instant", label: "Instant" },
                  { value: "daily", label: "Daily" },
                  { value: "weekly", label: "Weekly" },
                ]}
                showSearch={false}
                triggerClassName="w-40 h-9 text-sm"
              />
            </div>

            {notifPrefsSaving && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
