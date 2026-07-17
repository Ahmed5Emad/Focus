import { Settings as SettingsIcon, User, Sliders, Bell, Briefcase } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AccountTab from './components/AccountTab';
import PreferencesTab from './components/PreferencesTab';
import NotificationsTab from './components/NotificationsTab';
import WorkspaceTab from './components/WorkspaceTab';

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
          <TabsTrigger value="account" className="gap-0.5 md:gap-3 px-1.5 md:px-4 py-1 md:py-2 text-[11px] md:text-base shrink-0">
            <User className="w-3 h-3 md:w-5 md:h-5" />
            Account
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-0.5 md:gap-3 px-1.5 md:px-4 py-1 md:py-2 text-[11px] md:text-base shrink-0">
            <Sliders className="w-3 h-3 md:w-5 md:h-5" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-0.5 md:gap-3 px-1.5 md:px-4 py-1 md:py-2 text-[11px] md:text-base shrink-0">
            <Bell className="w-3 h-3 md:w-5 md:h-5" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="workspace" className="gap-0.5 md:gap-3 px-1.5 md:px-4 py-1 md:py-2 text-[11px] md:text-base shrink-0">
            <Briefcase className="w-3 h-3 md:w-5 md:h-5" />
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
