import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  Camera,
  Edit2,
  Folder,
  Users,
  Trash2,
} from 'lucide-react';
import { Dropdown } from '@/components/shared/Dropdown';
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface WorkspaceMember {
  member_id: string;
  user_id: string;
  email: string;
  role: string;
  joined_at: string;
}

export default function WorkspaceTab() {
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

  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [removeConfirmMemberId, setRemoveConfirmMemberId] = useState<string | null>(null);

  const [latestProjects, setLatestProjects] = useState<{ id: string; title: string; status: string }[]>([]);

  const currentWorkspace = workspaces.find(w => w.id === currentWorkspaceId);

  useEffect(() => {
    if (currentWorkspaceId) {
      fetchMembers();
      fetchCurrentUserRole();
      fetchLatestProjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkspaceId]);

  useEffect(() => {
    if (currentWorkspace) setWorkspaceName(currentWorkspace.name);
  }, [currentWorkspace]);

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

  const handleDeleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase.from('projects').delete().eq('id', projectId);
      if (error) throw error;
      setLatestProjects(prev => prev.filter(p => p.id !== projectId));
      toast.success("Project deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete project');
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
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">General Info</h3>
              {canManageWorkspace && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1.5 rounded-md text-red-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Delete workspace"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

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
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{p.status}</span>
                        <button
                          onClick={() => handleDeleteProject(p.id)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                ))}
              </div>
            )}
          </div>

          <ConfirmDialog
            open={showDeleteConfirm}
            onOpenChange={(open) => { if (!open) setShowDeleteConfirm(false); }}
            onConfirm={handleDeleteWorkspace}
            title="Delete Workspace"
            description={`Are you sure you want to permanently delete "${currentWorkspace?.name}"? All associated data including tasks, messages, and projects will be lost. This action cannot be undone.`}
            confirmLabel="Yes, delete workspace"
            destructive
          />

          <div className="flex items-center justify-end gap-4 pt-6">
            <Button variant="outline" className="px-6" onClick={() => { if (currentWorkspace) setWorkspaceName(currentWorkspace.name); }}>Discard Changes</Button>
            <Button className="px-8 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" onClick={handleRenameWorkspace}>Save Configuration</Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!removeConfirmMemberId}
        onOpenChange={(open) => { if (!open) setRemoveConfirmMemberId(null); }}
        onConfirm={() => removeConfirmMemberId && handleRemoveMember(removeConfirmMemberId)}
        title="Remove Member"
        description="Are you sure you want to remove this member from the workspace? They will lose access to all workspace data."
        confirmLabel="Remove"
        destructive
      />
    </>
  );
}
