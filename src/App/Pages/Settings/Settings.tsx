import { Settings as SettingsIcon, User, Sliders, Bell, Briefcase } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AccountTab from './components/AccountTab';
import PreferencesTab from './components/PreferencesTab';
import NotificationsTab from './components/NotificationsTab';
import WorkspaceTab from './components/WorkspaceTab';

export default function Settings() {
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
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <AccountTab />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <PreferencesTab />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationsTab />
        </TabsContent>

        <TabsContent value="workspace" className="space-y-6">
          <WorkspaceTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
