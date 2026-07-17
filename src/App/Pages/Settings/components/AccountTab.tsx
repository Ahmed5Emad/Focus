import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Loader2,
  Check,
  User,
  Trash2,
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function AccountTab() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [profile, setProfile] = useState<{ display_name: string; avatar_url: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    if (user) fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    setProfileLoading(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle();
      if (data) {
        setProfile({ display_name: data.display_name ?? '', avatar_url: data.avatar_url ?? '' });
      } else {
        setProfile({ display_name: user.user_metadata?.name ?? '', avatar_url: '' });
      }
    } catch {
      setProfile({ display_name: user.user_metadata?.name ?? '', avatar_url: '' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { data, error } = await supabase.rpc('delete_account');
      if (error) throw error;
      const result = data as { success: boolean; error?: string };
      if (!result.success) throw new Error(result.error ?? 'Failed to delete account');
      await supabase.auth.signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete account');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;
    setProfileSaving(true);
    setProfileSaved(false);
    setProfileError('');
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        display_name: profile.display_name.trim() || null,
        avatar_url: profile.avatar_url.trim() || null,
      });
      if (error) throw error;
      setProfileSaved(true);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-card rounded-xl p-4 sm:p-6 shadow-sm border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-cu-purple/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Profile Information</h3>
              <p className="text-sm text-muted-foreground">Update your display name and avatar.</p>
            </div>
          </div>

          {profileLoading ? (
            <div className="space-y-5">
              <div className="space-y-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <Skeleton className="h-10 w-28 rounded-lg" />
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</Label>
                <Input
                  value={user?.email ?? ''}
                  readOnly
                  className="bg-muted/50 text-muted-foreground"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Display Name</Label>
                <Input
                  value={profile?.display_name ?? ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, display_name: e.target.value } : null)}
                  placeholder="Your name"
                  className="bg-muted/50"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Avatar URL</Label>
                <Input
                  value={profile?.avatar_url ?? ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, avatar_url: e.target.value } : null)}
                  placeholder="https://example.com/avatar.jpg"
                  className="bg-muted/50"
                />
              </div>

              {profileError && <p className="text-sm text-destructive">{profileError}</p>}
              {profileSaved && (
                <div className="flex items-center gap-2 text-sm text-cu-green">
                  <Check className="w-4 h-4" />
                  Profile updated successfully
                </div>
              )}

              <Button
                onClick={handleSaveProfile}
                disabled={profileSaving}
                className="bg-primary hover:opacity-90 text-white w-full sm:w-auto"
              >
                {profileSaving ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  'Save Profile'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-card rounded-xl p-4 sm:p-6 shadow-sm border">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="text-2xl bg-cu-purple/10 text-primary">
                  {(profile?.display_name || user?.email || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <h3 className="text-lg font-semibold">{profile?.display_name || 'No name set'}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 sm:p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">Account Info</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">User ID</span>
              <span className="font-mono text-xs truncate max-w-[120px] sm:max-w-[180px]">{user?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email verified</span>
              <span>{user?.email_confirmed_at ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-destructive/20">
          <h3 className="text-lg font-semibold text-destructive mb-2">Danger Zone</h3>
          <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all associated data.</p>
          <Button onClick={() => setDeleteConfirmOpen(true)} variant="destructive" className="w-full">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Account"
        description="This will permanently delete your account and all data. This action cannot be undone."
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete Account'}
        onConfirm={handleDeleteAccount}
        destructive
      />
    </div>
  );
}
