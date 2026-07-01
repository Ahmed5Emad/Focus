import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
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
} from 'lucide-react';
import { Dropdown } from '@/components/shared/Dropdown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WorkspaceMember {
  member_id: string;
  user_id: string;
  email: string;
  role: string;
  joined_at: string;
}

export default function Settings() {
  const { user, currentWorkspaceId, workspaces, refreshWorkspaces, setCurrentWorkspaceId } = useAuth();
  const [supabase] = useState(() => createClient());

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

  useEffect(() => {
    if (currentWorkspaceId) {
      fetchMembers();
      fetchCurrentUserRole();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkspaceId]);

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
        alert(result.error);
        return;
      }
      setMembers(prev => prev.map(m => m.member_id === memberId ? { ...m, role: newRole } : m));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update role');
    }
  };

  const canChangeRoles = currentUserRole === 'owner' || currentUserRole === 'admin';
  const roleOptions = currentUserRole === 'owner'
    ? ['admin', 'sub admin', 'member']
    : ['sub admin', 'member'];

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

      if (error) {
        if (error.message.includes('named parameter "p_role"')) {
          const { error: fallbackError } = await supabase.rpc('invite_user_to_workspace', {
            p_email: inviteEmail.trim(),
            p_workspace_id: currentWorkspaceId,
          });
          if (fallbackError) throw fallbackError;
        } else {
          throw error;
        }
      }

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
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to rename workspace');
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
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete workspace');
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
        <TabsList className="mb-8 bg-muted/50 p-1">
          <TabsTrigger value="account" className="gap-2">
            <User className="w-4 h-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Sliders className="w-4 h-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="workspace" className="gap-2">
            <Briefcase className="w-4 h-4" />
            Workspace
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Puzzle className="w-4 h-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-xl p-6 shadow-sm border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[#f5f3ff] flex items-center justify-center">
                    <User className="w-5 h-5 text-[#7b68ee]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Profile Information</h3>
                    <p className="text-sm text-muted-foreground">Update your display name and avatar.</p>
                  </div>
                </div>

                {profileLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
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
                      className="bg-[#7b68ee] hover:opacity-90 text-white"
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
                      <AvatarFallback className="text-2xl bg-[#f5f3ff] text-[#7b68ee]">
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
                  <ListChecks className="w-5 h-5 text-[#7b68ee]" />
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
                    value="todo"
                    onValueChange={() => {}}
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
                    <input type="checkbox" defaultChecked className="rounded border-input text-[#7b68ee] focus:ring-[#7b68ee]" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Auto-archive completed tasks</p>
                    <p className="text-xs text-muted-foreground">Hide completed tasks after 7 days.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="rounded border-input text-[#7b68ee] focus:ring-[#7b68ee]" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Show completed tasks</p>
                    <p className="text-xs text-muted-foreground">Display completed tasks in the task list.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="rounded border-input text-[#7b68ee] focus:ring-[#7b68ee]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#f5f3ff] flex items-center justify-center">
                  <Folder className="w-5 h-5 text-[#7b68ee]" />
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
                    value="list"
                    onValueChange={() => {}}
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
                    <input type="checkbox" className="rounded border-input text-[#7b68ee] focus:ring-[#7b68ee]" />
                  </div>
                </div>
              </div>
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
                    <input type="checkbox" defaultChecked className="rounded border-input text-primary focus:ring-primary" />
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
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
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
                                {member.role} • Joined {new Date(member.joined_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          {canChangeRoles ? (
                            <Dropdown
                              value={member.role}
                              onValueChange={(val) => val && handleRoleChange(member.member_id, val)}
                              options={roleOptions.map(opt => ({
                                value: opt,
                                label: opt === 'sub admin' ? 'Sub Admin' : opt
                              }))}
                              showSearch={false}
                              triggerClassName="w-auto min-w-[90px] h-8 text-xs font-medium px-2 py-1 capitalize"
                            />
                          ) : (
                            <span className="text-xs font-medium px-2 py-1 rounded-md border bg-background text-foreground capitalize">
                              {member.role}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No members found.
                    </p>
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

                <div className="flex flex-col items-center justify-center py-12 text-center border rounded-xl bg-muted/10 border-dashed">
                  <p className="text-muted-foreground font-medium">There is no project yet</p>
                </div>
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
                <Button variant="outline" className="px-6">Discard Changes</Button>
                <Button className="px-8 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">Save Configuration</Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#f5f3ff] flex items-center justify-center">
              <Puzzle className="w-5 h-5 text-[#7b68ee]" />
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
                iconColor: "text-[#7b68ee]",
                connected: false,
              },
              {
                name: "GitHub",
                description: "Link pull requests and issues to tasks and track progress automatically.",
                icon: Folder,
                color: "bg-[#f1f5f9]",
                iconColor: "text-[#334155]",
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
                iconColor: "text-[#7b68ee]",
                connected: false,
              },
              {
                name: "Linear",
                description: "Two-way sync between Focus tasks and Linear issues.",
                icon: ListChecks,
                color: "bg-[#f1f5f9]",
                iconColor: "text-[#334155]",
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
                <h4 className="text-sm font-semibold text-[#0b1c30] mb-1">
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
                      : "bg-[#7b68ee] hover:opacity-90 text-white"
                  }
                >
                  {integration.connected ? "Disconnect" : "Connect"}
                </Button>
              </div>
            ))}
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-dashed flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-[#f5f3ff] flex items-center justify-center mb-3">
              <Puzzle className="w-6 h-6 text-[#7b68ee]" />
            </div>
            <h4 className="text-sm font-semibold text-[#0b1c30] mb-1">
              API Access
            </h4>
            <p className="text-xs text-muted-foreground max-w-md mb-4">
              Build custom integrations using our REST API. Generate an API key
              to get started.
            </p>
            <Button variant="outline" size="sm">
              Generate API Key
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
