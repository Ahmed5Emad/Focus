import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Loader2, 
  Camera, 
  Edit2, 
  Folder, 
  Settings as SettingsIcon,
  User,
  Sliders,
  Briefcase,
  Puzzle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WorkspaceMember {
  email: string;
  role: string;
  joined_at: string;
}

export default function Settings() {
  const { currentWorkspaceId, workspaces, refreshWorkspaces, setCurrentWorkspaceId } = useAuth();
  const supabase = createClient();

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

  useEffect(() => {
    if (currentWorkspaceId) {
      fetchMembers();
    }
  }, [currentWorkspaceId]);

  const fetchMembers = async () => {
    if (!currentWorkspaceId) return;
    setIsLoadingMembers(true);
    try {
      const { data, error } = await supabase.rpc('get_workspace_members_with_email', {
        p_workspace_id: currentWorkspaceId,
      });

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      console.error('Error fetching members:', error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

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
    } catch (error: any) {
      setCreateError(error.message || 'Failed to create workspace');
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
    } catch (error: any) {
      setInviteError(error.message || 'Failed to invite member');
    } finally {
      setIsInviting(false);
    }
  };

  const currentWorkspace = workspaces.find(w => w.id === currentWorkspaceId);

  return (
    <div className="w-full p-4 md:p-6 space-y-8">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-foreground flex items-center gap-2">
          <SettingsIcon className="w-8 h-8 text-cu-purple" />
          Settings
        </h2>
        <p className="text-muted-foreground mt-2">Manage your account, preferences, and workspace environments.</p>
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
          <div className="bg-card rounded-xl p-12 shadow-sm border border-dashed flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <User className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Account Settings</h3>
            <p className="text-muted-foreground max-w-md">
              Manage your personal profile, email addresses, and security preferences. This section is coming soon.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <div className="bg-card rounded-xl p-12 shadow-sm border border-dashed flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Sliders className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">App Preferences</h3>
            <p className="text-muted-foreground max-w-md">
              Customize your interface, notification settings, and language options. This section is coming soon.
            </p>
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
                    <Input 
                      className="w-full bg-muted/50" 
                      type="text" 
                      value={currentWorkspace?.name || 'ProWorkspace'} 
                      readOnly
                    />
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
                    <select 
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      disabled={isInviting || !currentWorkspaceId}
                    >
                      <option value="admin">Admin</option>
                      <option value="sub admin">Sub Admin</option>
                      <option value="member">Member</option>
                    </select>
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
                        <div key={idx} className="flex items-center justify-between p-3 border bg-muted/20 rounded-lg">
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
                          <select 
                            className="text-xs font-medium px-2 py-1 rounded-md border bg-background text-foreground capitalize"
                            defaultValue={member.role}
                          >
                            <option value="admin">Admin</option>
                            <option value="sub admin">Sub Admin</option>
                            <option value="member">Member</option>
                          </select>
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

              <div className="flex items-center justify-end gap-4 pt-6">
                <Button variant="outline" className="px-6">Discard Changes</Button>
                <Button className="px-8 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">Save Configuration</Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="bg-card rounded-xl p-12 shadow-sm border border-dashed flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Puzzle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Integrations</h3>
            <p className="text-muted-foreground max-w-md">
              Connect your favorite tools like Slack, GitHub, and Discord to streamline your workflow. This section is coming soon.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
