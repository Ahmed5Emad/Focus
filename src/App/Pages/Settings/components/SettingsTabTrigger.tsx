import type { LucideIcon } from 'lucide-react';
import { TabsTrigger } from '@/components/ui/tabs';

interface SettingsTabTriggerProps {
  value: string;
  icon: LucideIcon;
  label: string;
}

export default function SettingsTabTrigger({ value, icon: Icon, label }: SettingsTabTriggerProps) {
  return (
    <TabsTrigger value={value} className="gap-0.5 md:gap-3 px-1.5 md:px-4 py-1 md:py-2 text-[12px] md:text-base shrink-0">
      <Icon className="w-3 h-3 md:w-5 md:h-5" />
      {label}
    </TabsTrigger>
  );
}
