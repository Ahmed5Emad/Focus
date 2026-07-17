import { Settings as SettingsIcon, User, Sliders, Bell, Briefcase } from 'lucide-react';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import AccountTab from './components/AccountTab';
import PreferencesTab from './components/PreferencesTab';
import NotificationsTab from './components/NotificationsTab';
import WorkspaceTab from './components/WorkspaceTab';
import SettingsTabTrigger from './components/SettingsTabTrigger';

export default function Settings() {
  return (
    <div className="page-container pt-4 px-2 sm:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="page-title flex items-center gap-3 text-xl sm:text-2xl md:text-3xl">
          <SettingsIcon className="w-6 h-6 sm:w-8 sm:h-8 text-cu-purple" />
          Settings
        </h1>
        <p className="page-description">Manage your account, preferences, and workspace environments.</p>
      </div>

      <Tabs defaultValue="workspace" className="w-full">
        <TabsList className="mb-3 bg-muted/50 p-[3px] flex-nowrap overflow-x-auto scrollbar-none">
          <SettingsTabTrigger value="account" icon={User} label="Account" />
          <SettingsTabTrigger value="preferences" icon={Sliders} label="Preferences" />
          <SettingsTabTrigger value="notifications" icon={Bell} label="Notifications" />
          <SettingsTabTrigger value="workspace" icon={Briefcase} label="Workspace" />
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
