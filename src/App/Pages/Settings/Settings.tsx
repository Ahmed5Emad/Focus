import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { usePreferences } from '@/hooks/usePreferences';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { 
  Loader2, 
  Camera, 
  Edit2, 
  Folder, 
  Settings as SettingsIcon,
  User,
  Users,
  Sliders,
  Briefcase,
  Puzzle,
  ListChecks,
  Check,
  Trash2,
  AlertTriangle,
  Calendar,
  MessageCircle,
  FileText,
  Bell,
  Plus,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { Dropdown } from '@/components/shared/Dropdown';
import { EmptyState } from "@/components/shared/EmptyState";
import { useTasks } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface WorkspaceMember {
  member_id: string;
  user_id: string;
  email: string;
  role: string;
  joined_at: string;
}

export default function Settings() {
  const { user, currentWorkspaceId, workspaces, refreshWorkspaces, setCurrentWorkspaceId } = useAuth();
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  // Account / Profile state
  const [profile, setProfile] = useState<{ display_name: string; avatar_url: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Current user's role for permission checks
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [removeConfirmMemberId, setRemoveConfirmMemberId] = useState<string | null>(null);
  const [applyBrandingToEmail, setApplyBrandingToEmail] = useState(true);

  const [latestProjects, setLatestProjects] = useState<{ id: string; title: string; status: string }[]>([]);

  const { preferences, updatePreference } = usePreferences();

  // Notification preferences
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
    if (currentWorkspaceId) {
      fetchMembers();
      fetchCurrentUserRole();
      fetchLatestProjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkspaceId]);

  const fetchLatestProjects = async () => {
    if (!currentWorkspaceId) return;
    const { data } = await supabase
      .from("projects")
      .select("id, title, status")
      .eq("workspace_id", currentWorkspaceId)
      .order("created_at", { ascending: false })
      .limit(5);
    setLatestProjects(data ?? []);
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchNotifPrefs();
    }
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

  const fetchCurrentUserRole = async () => {
    if (!currentWorkspaceId || !user) return;
    const { data } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', currentWorkspaceId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (data) setCurrentUserRole(data.role);
  };

  const fetchMembers = async () => {
    if (!currentWorkspaceId) return;
    setIsLoadingMembers(true);
    try {
      const { data, error } = await supabase.rpc('get_workspace_members_with_email', {
        p_workspace_id: currentWorkspaceId,
      });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      const { data, error } = await supabase.rpc('update_member_role', {
        p_member_id: memberId,
        p_new_role: newRole,
      });
      if (error) throw error;
      const result = data as { success: boolean; error?: string };
      if (!result.success) {
        toast.error(result.error ?? "Failed to update role");
        return;
      }
      setMembers(prev => prev.map(m => m.member_id === memberId ? { ...m, role: newRole } : m));
      toast.success("Role updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update role');
    }
  };

  const canChangeRoles = currentUserRole === 'owner' || currentUserRole === 'admin' || currentUserRole === 'sub admin';
  const roleOptions = currentUserRole === 'owner'
    ? ['admin', 'sub admin', 'member']
    : currentUserRole === 'admin'
      ? ['sub admin', 'member']
      : ['member'];

  const handleCreateWorkspace = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    setIsCreating(true);
    setCreateError('');
    setCreateSuccess('');

    try {
      const { data, error } = await supabase.rpc('create_workspace', {
        p_name: newWorkspaceName.trim(),
      });

      if (error) throw error;

      await refreshWorkspaces();
      setCreateSuccess('Workspace created successfully!');
      setNewWorkspaceName('');
      
      if (data) setCurrentWorkspaceId(data);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Failed to create workspace');
    } finally {
      setIsCreating(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !currentWorkspaceId) return;

    setIsInviting(true);
    setInviteError('');
    setInviteSuccess('');

    try {
      const { error } = await supabase.rpc('invite_user_to_workspace', {
        p_email: inviteEmail.trim(),
        p_workspace_id: currentWorkspaceId,
        p_role: inviteRole,
      });

      if (error) throw error;

      setInviteSuccess('Member invited successfully!');
      setInviteEmail('');
      await fetchMembers();
    } catch (error) {
      setInviteError(error instanceof Error ? error.message : 'Failed to invite member');
    } finally {
      setIsInviting(false);
    }
  };

  const currentWorkspace = workspaces.find(w => w.id === currentWorkspaceId);

  useEffect(() => {
    if (currentWorkspace) setWorkspaceName(currentWorkspace.name);
  }, [currentWorkspace]);

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { data, error } = await supabase.rpc('remove_member', {
        p_member_id: memberId,
      });
      if (error) throw error;
      const result = data as { success: boolean; error?: string };
      if (!result.success) {
        toast.error(result.error ?? "Failed to remove member");
        return;
      }
      setMembers(prev => prev.filter(m => m.member_id !== memberId));
      toast.success("Member removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove member');
    }
  };

  const canManageWorkspace = currentUserRole === 'owner' || currentUserRole === 'admin';

  const handleRenameWorkspace = async () => {
    if (!currentWorkspaceId || !workspaceName.trim() || isRenaming) return;
    setIsRenaming(true);
    try {
      const { error } = await supabase.rpc('update_workspace_name', {
        p_workspace_id: currentWorkspaceId,
        p_name: workspaceName.trim(),
      });
      if (error) throw error;
      await refreshWorkspaces();
      toast.success("Workspace renamed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to rename workspace');
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!currentWorkspaceId || isDeleting) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.rpc('delete_workspace', {
        p_workspace_id: currentWorkspaceId,
      });
      if (error) throw error;
      setShowDeleteConfirm(false);
      await refreshWorkspaces();
      toast.success("Workspace deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete workspace');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="page-container pt-6">
      <div className="flex flex-col gap-1">
        <h1 className="page-title flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-cu-purple" />
          Settings
        </h1>
        <p className="page-description">Manage your account, preferences, and workspace environments.</p>
      </div>

      <Tabs defaultValue="workspace" className="w-full">
        <TabsList className="mb-3 bg-muted/50 p-1">
          <TabsTrigger value="account" className="gap-2">
            <User className="w-4 h-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Sliders className="w-4 h-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="workspace" className="gap-2">
            <Briefcase className="w-4 h-4" />
            Workspace
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Puzzle className="w-4 h-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="workflow" className="gap-2">
            <ListChecks className="w-4 h-4" />
            Workflow
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-xl p-6 shadow-sm border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[#f5f3ff] flex items-center justify-center">
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
                      className="bg-primary hover:opacity-90 text-white"
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
              <div className="bg-card rounded-xl p-6 shadow-sm border">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="text-2xl bg-[#f5f3ff] text-primary">
                        {(profile?.display_name || user?.email || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <h3 className="text-lg font-semibold">{profile?.display_name || 'No name set'}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-2">Account Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">User ID</span>
                    <span className="font-mono text-xs truncate max-w-[180px]">{user?.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email verified</span>
                    <span>{user?.email_confirmed_at ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#f5f3ff] flex items-center justify-center">
                  <ListChecks className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Task Defaults</h3>
                  <p className="text-sm text-muted-foreground">Configure default behavior for new tasks.</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Default status for new tasks</p>
                    <p className="text-xs text-muted-foreground">Tasks created without explicit status will use this.</p>
                  </div>
                  <Dropdown
                    value={preferences.defaultTaskStatus}
                    onValueChange={(val) => val && updatePreference('defaultTaskStatus', val)}
                    options={[{ value: "todo", label: "To Do" }, { value: "in_progress", label: "In Progress" }]}
                    showSearch={false}
                    triggerClassName="w-40 h-9 text-sm"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Auto-assign to self</p>
                    <p className="text-xs text-muted-foreground">New tasks are automatically assigned to you.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={preferences.autoAssignToSelf} onChange={(e) => updatePreference('autoAssignToSelf', e.target.checked)} className="rounded border-input text-primary focus:ring-primary" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Auto-archive completed tasks</p>
                    <p className="text-xs text-muted-foreground">Hide completed tasks after 7 days.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={preferences.autoArchiveCompleted} onChange={(e) => updatePreference('autoArchiveCompleted', e.target.checked)} className="rounded border-input text-primary focus:ring-primary" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Show completed tasks</p>
                    <p className="text-xs text-muted-foreground">Display completed tasks in the task list.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={preferences.showCompletedTasks} onChange={(e) => updatePreference('showCompletedTasks', e.target.checked)} className="rounded border-input text-primary focus:ring-primary" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#f5f3ff] flex items-center justify-center">
                  <Folder className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Project Defaults</h3>
                  <p className="text-sm text-muted-foreground">Manage how projects behave by default.</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Default project view</p>
                    <p className="text-xs text-muted-foreground">Choose the default layout for projects.</p>
                  </div>
                  <Dropdown
                    value={preferences.defaultProjectView}
                    onValueChange={(val) => val && updatePreference('defaultProjectView', val)}
                    options={[{ value: "list", label: "List" }, { value: "board", label: "Board" }]}
                    showSearch={false}
                    triggerClassName="w-40 h-9 text-sm"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Auto-close completed projects</p>
                    <p className="text-xs text-muted-foreground">Mark projects as completed when all tasks are done.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={preferences.autoCloseCompletedProjects} onChange={(e) => updatePreference('autoCloseCompletedProjects', e.target.checked)} className="rounded border-input text-primary focus:ring-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="workspace" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-card rounded-xl p-6 shadow-sm border">
                <h3 className="text-xl font-semibold mb-4">General Info</h3>
                
                <div className="flex flex-col items-center mb-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden transition-all group-hover:border-primary">
                      <Camera className="text-muted-foreground w-8 h-8 group-hover:text-primary transition-colors" />
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-2 bg-primary text-primary-foreground rounded-lg shadow-lg active:scale-90 transition-transform">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider mt-4 text-muted-foreground">Workspace Icon</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Workspace Name</Label>
                    <div className="flex gap-2">
                      <Input 
                        className="w-full bg-muted/50" 
                        type="text" 
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        readOnly={!canManageWorkspace}
                      />
                      {canManageWorkspace && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleRenameWorkspace}
                          disabled={isRenaming || !workspaceName.trim() || workspaceName === currentWorkspace?.name}
                        >
                          {isRenaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit2 className="w-4 h-4" />}
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Workspace URL</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-muted-foreground text-sm">
                        app.pro.com/
                      </span>
                      <Input 
                        className="flex-1 rounded-l-none bg-muted/50" 
                        type="text" 
                        value={currentWorkspace?.name?.toLowerCase().replace(/\s+/g, '-') || 'proworkspace-hq'} 
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm border">
                <h3 className="text-xl font-semibold mb-4">Create Workspace</h3>
                <form onSubmit={handleCreateWorkspace} className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">New Workspace Name</Label>
                    <Input
                      placeholder="e.g. Marketing Team"
                      value={newWorkspaceName}
                      onChange={(e) => setNewWorkspaceName(e.target.value)}
                      disabled={isCreating}
                      className="bg-muted/50"
                    />
                  </div>

                  {createError && <p className="text-sm text-destructive">{createError}</p>}
                  {createSuccess && <p className="text-sm text-cu-green">{createSuccess}</p>}

                  <Button type="submit" disabled={isCreating || !newWorkspaceName.trim()} className="w-full">
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Workspace'
                    )}
                  </Button>
                </form>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm border">
                <h3 className="text-xl font-semibold mb-4">Custom Branding</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-cu-purple shadow-sm"></div>
                      <span className="text-sm font-medium">Primary Color</span>
                    </div>
                    <span className="text-sm font-mono text-muted-foreground uppercase">#6b38d4</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-cu-blue shadow-sm"></div>
                      <span className="text-sm font-medium">Accent Color</span>
                    </div>
                    <span className="text-sm font-mono text-muted-foreground uppercase">#00687a</span>
                  </div>
                  <div className="flex items-center gap-3 px-1">
                    <input type="checkbox" checked={applyBrandingToEmail} onChange={(e) => setApplyBrandingToEmail(e.target.checked)} className="rounded border-input text-primary focus:ring-primary" />
                    <span className="text-sm text-muted-foreground">Apply branding to email templates</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <div className="bg-card rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold">Invite Members</h3>
                    <p className="text-sm text-muted-foreground">Add new collaborators to your workspace.</p>
                  </div>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                    New Invites
                  </span>
                </div>

                <form onSubmit={handleInviteMember} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-muted/30 p-4 rounded-xl border">
                  <div className="md:col-span-6 space-y-1">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                    <Input 
                      type="email" 
                      placeholder="colleague@company.com" 
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      disabled={isInviting || !currentWorkspaceId}
                      className="bg-background"
                    />
                  </div>
                  <div className="md:col-span-3 space-y-1">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Role</Label>
                    <Dropdown
                      value={inviteRole}
                      onValueChange={(val) => val && setInviteRole(val)}
                      options={roleOptions.map(opt => ({
                        value: opt,
                        label: opt === 'sub admin' ? 'Sub Admin' : opt.charAt(0).toUpperCase() + opt.slice(1)
                      }))}
                      showSearch={false}
                      triggerClassName="w-full h-10"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Button type="submit" disabled={isInviting || !inviteEmail.trim() || !currentWorkspaceId} className="w-full">
                      {isInviting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Send Invite'
                      )}
                    </Button>
                  </div>
                </form>

                {inviteError && <p className="text-sm text-destructive mt-2">{inviteError}</p>}
                {inviteSuccess && <p className="text-sm text-cu-green mt-2">{inviteSuccess}</p>}

                <div className="mt-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Current Members</h4>
                  
                  {isLoadingMembers ? (
                    <div className="space-y-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-8 h-8 rounded-full" />
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-40" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                          <Skeleton className="h-8 w-24 rounded-md" />
                        </div>
                      ))}
                    </div>
                  ) : members.length > 0 ? (
                    <div className="space-y-2">
                      {members.map((member, idx) => (
                        <div key={member.member_id ?? idx} className="flex items-center justify-between p-3 border bg-muted/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold uppercase">
                              {member.email.substring(0, 2)}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-foreground">{member.email}</span>
                              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                                {member.role === 'owner' ? 'Owner' : member.role === 'sub admin' ? 'Sub Admin' : member.role.charAt(0).toUpperCase() + member.role.slice(1)} • Joined {new Date(member.joined_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {canChangeRoles ? (
                              <Dropdown
                                value={member.role}
                                onValueChange={(val) => val && handleRoleChange(member.member_id, val)}
                                options={roleOptions.map(opt => ({
                                  value: opt,
                                  label: opt === 'sub admin' ? 'Sub Admin' : opt.charAt(0).toUpperCase() + opt.slice(1)
                                }))}
                                showSearch={false}
                                triggerClassName="w-auto min-w-36 h-8 text-xs font-medium px-2 py-1 capitalize"
                              />
                            ) : (
                              <span className="text-xs font-medium px-2 py-1 rounded-md border bg-background text-foreground capitalize">
                                {member.role === 'owner' ? 'Owner' : member.role === 'sub admin' ? 'Sub Admin' : member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                              </span>
                            )}
                            {member.role !== 'owner' && currentUserRole && ['owner', 'admin', 'sub admin'].includes(currentUserRole) && (
                              <button
                                onClick={() => setRemoveConfirmMemberId(member.member_id)}
                                className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                title="Remove member"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Users}
                      title="No members found"
                      description="Invite members to your workspace to collaborate."
                    />
                  )}
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Folder className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Latest Projects</h3>
                    <p className="text-sm text-muted-foreground">Recent activity and milestone tracking.</p>
                  </div>
                </div>

                {latestProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center border rounded-xl bg-muted/10 border-dashed">
                    <p className="text-muted-foreground font-medium">There is no project yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {latestProjects.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                        <div className="flex items-center gap-3">
                          <Folder className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">{p.title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{p.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {canManageWorkspace && (
                <div className="bg-card rounded-xl p-6 shadow-sm border border-destructive/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-destructive">Danger Zone</h3>
                      <p className="text-sm text-muted-foreground">Irreversible actions for workspace admins.</p>
                    </div>
                  </div>

                  {!showDeleteConfirm ? (
                    <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg border border-destructive/10">
                      <div>
                        <p className="text-sm font-medium">Delete this workspace</p>
                        <p className="text-xs text-muted-foreground">Permanently remove the workspace and all its data.</p>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Workspace
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/10 space-y-3">
                      <p className="text-sm font-medium">Are you absolutely sure?</p>
                      <p className="text-xs text-muted-foreground">
                        This will permanently delete the workspace <strong>{currentWorkspace?.name}</strong> and all associated data including tasks, messages, and projects. This action cannot be undone.
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={handleDeleteWorkspace}
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...</>
                          ) : (
                            <><Trash2 className="w-4 h-4 mr-2" /> Yes, delete workspace</>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={isDeleting}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-4 pt-6">
                <Button variant="outline" className="px-6" onClick={() => { if (currentWorkspace) setWorkspaceName(currentWorkspace.name); }}>Discard Changes</Button>
                <Button className="px-8 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" onClick={handleRenameWorkspace}>Save Configuration</Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#f5f3ff] flex items-center justify-center">
              <Puzzle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Integrations</h3>
              <p className="text-sm text-muted-foreground">
                Connect your favorite tools to streamline your workflow.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                name: "Slack",
                description: "Get task notifications and updates directly in your Slack channels.",
                icon: MessageCircle,
                color: "bg-[#f5f3ff]",
                iconColor: "text-primary",
                connected: false,
              },
              {
                name: "GitHub",
                description: "Link pull requests and issues to tasks and track progress automatically.",
                icon: Folder,
                color: "bg-slate-100",
                iconColor: "text-slate-700",
                connected: true,
              },
              {
                name: "Discord",
                description: "Receive focus session updates and task reminders in your Discord server.",
                icon: MessageCircle,
                color: "bg-[#ede9fe]",
                iconColor: "text-[#6d28d9]",
                connected: false,
              },
              {
                name: "Google Calendar",
                description: "Sync your tasks and deadlines with Google Calendar for better scheduling.",
                icon: Calendar,
                color: "bg-[#f0f9ff]",
                iconColor: "text-[#3b82f6]",
                connected: false,
              },
              {
                name: "Notion",
                description: "Export tasks and goals to Notion for extended documentation.",
                icon: FileText,
                color: "bg-[#f5f3ff]",
                iconColor: "text-primary",
                connected: false,
              },
              {
                name: "Linear",
                description: "Two-way sync between Focus tasks and Linear issues.",
                icon: ListChecks,
                color: "bg-slate-100",
                iconColor: "text-slate-700",
                connected: false,
              },
            ].map((integration) => (
              <div
                key={integration.name}
                className="bg-card rounded-xl p-5 shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-10 h-10 rounded-lg ${integration.color} flex items-center justify-center`}
                  >
                    <integration.icon
                      className={`w-5 h-5 ${integration.iconColor}`}
                    />
                  </div>
                  {integration.connected && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                      Connected
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-semibold text-slate-900 mb-1">
                  {integration.name}
                </h4>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  {integration.description}
                </p>
                <Button
                  variant={integration.connected ? "outline" : "default"}
                  size="sm"
                  className={
                    integration.connected
                      ? ""
                      : "bg-primary hover:opacity-90 text-white"
                  }
                  onClick={() => toast.info(integration.connected ? "Disconnect coming soon" : "Integration coming soon")}
                >
                  {integration.connected ? "Disconnect" : "Connect"}
                </Button>
              </div>
            ))}
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-dashed flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-[#f5f3ff] flex items-center justify-center mb-3">
              <Puzzle className="w-6 h-6 text-primary" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900 mb-1">
              API Access
            </h4>
            <p className="text-xs text-muted-foreground max-w-md mb-4">
              Build custom integrations using our REST API. Generate an API key
              to get started.
            </p>
            <Button variant="outline" size="sm" onClick={() => toast.info("API key generation coming soon")}>
              Generate API Key
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="workflow" className="space-y-6">
          <WorkflowSettingsContent />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={!!removeConfirmMemberId}
        onOpenChange={(open) => { if (!open) setRemoveConfirmMemberId(null); }}
        onConfirm={() => removeConfirmMemberId && handleRemoveMember(removeConfirmMemberId)}
        title="Remove Member"
        description="Are you sure you want to remove this member from the workspace? They will lose access to all workspace data."
        confirmLabel="Remove"
        destructive
      />
    </div>
  );
}

function WorkflowSettingsContent() {
  const { currentWorkspaceId } = useAuth();
  const {
    workflowStatuses,
    customFields,
    addWorkflowStatus,
    updateWorkflowStatus,
    deleteWorkflowStatus,
    addCustomField,
    deleteCustomField,
  } = useTasks();

  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('#7b68ee');
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [editingStatusName, setEditingStatusName] = useState('');
  const [editingStatusColor, setEditingStatusColor] = useState('');

  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const [newFieldOptions, setNewFieldOptions] = useState('');

  const handleAddStatus = async () => {
    if (!newStatusName.trim()) return;
    const ok = await addWorkflowStatus(newStatusName.trim(), newStatusColor);
    if (ok) {
      setNewStatusName('');
      setNewStatusColor('#7b68ee');
      toast.success('Status added');
    } else {
      toast.error('Failed to add status');
    }
  };

  const handleUpdateStatus = async (id: string) => {
    const ok = await updateWorkflowStatus(id, { name: editingStatusName, color: editingStatusColor } as any);
    if (ok) {
      setEditingStatusId(null);
      toast.success('Status updated');
    } else {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteStatus = async (id: string) => {
    const ok = await deleteWorkflowStatus(id);
    if (ok) {
      toast.success('Status deleted');
    } else {
      toast.error('Failed to delete status');
    }
  };

  const handleMoveStatus = async (id: string, direction: 'up' | 'down') => {
    const idx = workflowStatuses.findIndex(s => s.id === id);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === workflowStatuses.length - 1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const current = workflowStatuses[idx];
    const target = workflowStatuses[targetIdx];
    await updateWorkflowStatus(current.id, { position: target.position } as any);
    await updateWorkflowStatus(target.id, { position: current.position } as any);
  };

  const handleAddField = async () => {
    if (!newFieldName.trim()) return;
    let options: string[] = [];
    if (newFieldType === 'select' || newFieldType === 'multi_select') {
      options = newFieldOptions.split(',').map(s => s.trim()).filter(Boolean);
    }
    const ok = await addCustomField({
      workspace_id: currentWorkspaceId!,
      name: newFieldName.trim(),
      field_type: newFieldType,
      options,
      position: customFields.length,
    });
    if (ok) {
      setNewFieldName('');
      setNewFieldType('text');
      setNewFieldOptions('');
      toast.success('Custom field added');
    } else {
      toast.error('Failed to add custom field');
    }
  };

  const handleDeleteField = async (id: string) => {
    const ok = await deleteCustomField(id);
    if (ok) {
      toast.success('Custom field deleted');
    } else {
      toast.error('Failed to delete custom field');
    }
  };

  if (!currentWorkspaceId) {
    return (
      <EmptyState
        icon={ListChecks}
        title="No workspace selected"
        description="Select a workspace to configure workflow settings."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card rounded-xl p-6 shadow-sm border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#f5f3ff] flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Custom Statuses</h3>
            <p className="text-sm text-muted-foreground">Define custom task statuses for this workspace.</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {workflowStatuses.map((status, idx) => (
            <div
              key={status.id}
              className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border"
            >
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => handleMoveStatus(status.id, 'up')}
                  disabled={idx === 0}
                  className="w-4 h-3 flex items-center justify-center text-slate-400 hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleMoveStatus(status.id, 'down')}
                  disabled={idx === workflowStatuses.length - 1}
                  className="w-4 h-3 flex items-center justify-center text-slate-400 hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>

              {editingStatusId === status.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="color"
                    value={editingStatusColor}
                    onChange={(e) => setEditingStatusColor(e.target.value)}
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                  <Input
                    value={editingStatusName}
                    onChange={(e) => setEditingStatusName(e.target.value)}
                    className="flex-1 h-8 text-sm"
                    placeholder="Status name"
                  />
                  <Button size="sm" variant="ghost" onClick={() => handleUpdateStatus(status.id)} className="h-8 px-2">
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingStatusId(null)} className="h-8 px-2">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{ backgroundColor: status.color }}
                  />
                  <span className="flex-1 text-sm font-medium">{status.name}</span>
                  {status.is_default && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      Default
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingStatusId(status.id);
                      setEditingStatusName(status.name);
                      setEditingStatusColor(status.color);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  {!status.is_default && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteStatus(status.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </>
              )}
            </div>
          ))}
          {workflowStatuses.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No custom statuses defined yet.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 pt-3 border-t">
          <input
            type="color"
            value={newStatusColor}
            onChange={(e) => setNewStatusColor(e.target.value)}
            className="w-9 h-9 rounded border cursor-pointer shrink-0"
          />
          <Input
            value={newStatusName}
            onChange={(e) => setNewStatusName(e.target.value)}
            placeholder="New status name"
            className="flex-1 h-9 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleAddStatus()}
          />
          <Button
            size="sm"
            onClick={handleAddStatus}
            disabled={!newStatusName.trim()}
            className="h-9 px-3 bg-primary hover:opacity-90 text-white"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#f5f3ff] flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Custom Fields</h3>
            <p className="text-sm text-muted-foreground">Add custom data fields to your tasks.</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {customFields.map((field) => (
            <div
              key={field.id}
              className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{field.name}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {field.field_type}
                  </span>
                </div>
                {field.options.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    Options: {field.options.join(', ')}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteField(field.id)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
          {customFields.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No custom fields defined yet.
            </p>
          )}
        </div>

        <div className="space-y-3 pt-3 border-t">
          <div className="flex gap-2">
            <Input
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              placeholder="Field name"
              className="flex-1 h-9 text-sm"
            />
            <Dropdown
              value={newFieldType}
              onValueChange={(val) => setNewFieldType(val ?? 'text')}
              options={[
                { value: 'text', label: 'Text' },
                { value: 'number', label: 'Number' },
                { value: 'date', label: 'Date' },
                { value: 'select', label: 'Select' },
                { value: 'multi_select', label: 'Multi Select' },
              ]}
              showSearch={false}
              triggerClassName="w-32 h-9 text-sm"
            />
          </div>
          {(newFieldType === 'select' || newFieldType === 'multi_select') && (
            <Input
              value={newFieldOptions}
              onChange={(e) => setNewFieldOptions(e.target.value)}
              placeholder="Comma-separated options"
              className="h-9 text-sm"
            />
          )}
          <Button
            size="sm"
            onClick={handleAddField}
            disabled={!newFieldName.trim()}
            className="w-full h-9 bg-primary hover:opacity-90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Field
          </Button>
        </div>
      </div>
    </div>
  );
}

