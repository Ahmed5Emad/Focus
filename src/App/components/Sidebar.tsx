import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  Timer,
  Target,
  Archive,
  Settings,
  HelpCircle,
  Plus,
  Building2,
  Layout,
  MessageCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Dropdown } from "@/components/shared/Dropdown";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Tasks", icon: CheckSquare, path: "/tasks" },
  { name: "Projects", icon: Layout, path: "/projects" },
  { name: "Goals", icon: Target, path: "/goals" },
  { name: "Documents", icon: FileText, path: "/documents" },
  { name: "Chat", icon: MessageCircle, path: "/chat" },
  { name: "Focus Timer", icon: Timer, path: "/focus-timer" },
  { name: "Archive", icon: Archive, path: "/archive" },
];

const bottomNavItems = [
  { name: "Settings", icon: Settings, path: "/settings" },
  { name: "Support", icon: HelpCircle, path: "/support" },
];

function SidebarContent({ compact }: { compact?: boolean }) {
  const location = useLocation();
  const { workspaces, currentWorkspaceId, setCurrentWorkspaceId } = useAuth();

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  if (compact) {
    return (
      <div className="w-full flex flex-col gap-6 items-center px-2">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] text-white font-['Spline_Sans',sans-serif] font-bold text-lg">
          F
        </div>
        <nav className="flex flex-col gap-1 w-full items-center">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                title={item.name}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  active ? "bg-[#f5f3ff] text-[#6d28d9]" : "text-muted-foreground hover:bg-muted"
                )}
              >
                <item.icon className="w-[18px] h-[18px]" />
              </Link>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col gap-[16px] items-start px-[24px] w-full">
        <div className="flex flex-col gap-[4px] w-full">
          <div className="flex flex-col font-['Spline_Sans',sans-serif] font-bold justify-center text-foreground text-[24px] tracking-[-1.2px] w-full">
            <p className="leading-[32px]">FOCUS</p>
          </div>
          <div className="flex flex-col font-['Inter',sans-serif] font-normal justify-center text-muted-foreground text-[12px] tracking-[1.2px] uppercase w-full">
            <p className="leading-[16px]">DEEP WORK ENGINE</p>
          </div>
        </div>
      </div>
      <div className="px-[16px] w-full">
        <Dropdown
          value={currentWorkspaceId}
          onValueChange={(val) => setCurrentWorkspaceId(val ?? workspaces[0]?.id)}
          options={workspaces.map((w) => ({ value: w.id, label: w.name }))}
          placeholder="Select Workspace"
          icon={<Building2 className="w-3.5 h-3.5 shrink-0 text-cu-purple" />}
          showSearch={false}
          triggerClassName="w-full px-[16px] py-[12px] bg-muted border border-border rounded-md hover:bg-muted/80 transition-colors h-auto"
        />
      </div>

      <div className="px-[16px] w-full">
        <Link to="/tasks/new" className="bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] drop-shadow-[0px_4px_6px_rgba(139,92,246,0.2)] flex gap-[8px] items-center justify-center px-[16px] py-[12px] rounded-[4px] w-full hover:opacity-90 transition-opacity cursor-pointer border-none no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <Plus className="w-[14px] h-[14px] text-white" />
          <span className="font-['Spline_Sans',sans-serif] font-semibold text-[12px] text-white tracking-[1.2px]">
            New Task
          </span>
        </Link>
      </div>

      <nav className="flex flex-col gap-[4px] px-[8px] w-full">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex gap-[12px] items-center px-[16px] py-[12px] rounded-[4px] w-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                active
                  ? "bg-[#f5f3ff] border-primary border-l-2 text-[#6d28d9]"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <item.icon className={cn("w-[18px] h-[18px]", active ? "text-[#6d28d9]" : "text-muted-foreground")} />
              <span className="font-['Inter',sans-serif] font-normal text-[12px] tracking-[1.2px] uppercase">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
}

function BottomLink({ item, expanded }: { item: typeof bottomNavItems[number]; expanded: boolean }) {
  const location = useLocation();
  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };
  const active = isActive(item.path);

  if (expanded) {
    return (
      <Link
        to={item.path}
        className={cn(
          "flex gap-[12px] items-center px-[16px] py-[12px] rounded-[4px] w-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          active
            ? "bg-[#f5f3ff] border-primary border-l-2 text-[#6d28d9]"
            : "text-muted-foreground hover:bg-muted"
        )}
      >
        <item.icon className={cn("w-[20px] h-[20px]", active ? "text-[#6d28d9]" : "text-muted-foreground")} />
        <span className="font-['Inter',sans-serif] font-normal text-[12px] tracking-[1.2px] uppercase">{item.name}</span>
      </Link>
    );
  }

  return (
    <Link
      to={item.path}
      title={item.name}
      className={cn(
        "flex items-center justify-center w-10 h-10 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        active ? "bg-[#f5f3ff] text-[#6d28d9]" : "text-muted-foreground hover:bg-muted"
      )}
    >
      <item.icon className="w-[18px] h-[18px]" />
    </Link>
  );
}

export function Sidebar({ expanded, onToggle, mobileSheetOpen, setMobileSheetOpen }: SidebarProps & { mobileSheetOpen?: boolean; setMobileSheetOpen?: (open: boolean) => void }) {
  return (
    <>
      <aside className={`hidden md:flex bg-card border-border border-r border-solid flex-col h-screen items-start pt-[32px] relative shrink-0 sticky top-0 transition-all duration-300 ${expanded ? 'w-[256px]' : 'w-[72px]'}`}>
        {expanded ? <SidebarContent /> : <SidebarContent compact />}
        <div className={cn("mt-auto w-full flex flex-col", expanded ? "px-[16px] gap-[4px]" : "px-2 gap-1 items-center")}>
          {bottomNavItems.map((item) => (
            <BottomLink key={item.name} item={item} expanded={expanded} />
          ))}
        </div>
        <button
          onClick={onToggle}
          className="w-full border-t border-border p-3 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shrink-0"
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {expanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </aside>

      <Sheet open={mobileSheetOpen} onOpenChange={(open) => setMobileSheetOpen?.(open)}>
        <SheetContent side="left" className="w-[256px] p-0">
          <div className="flex flex-col pt-[32px] h-full">
            <SidebarContent />
            <div className="mt-auto w-full px-[16px] flex flex-col gap-[4px]">
              {bottomNavItems.map((item) => (
                <BottomLink key={item.name} item={item} expanded />
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
