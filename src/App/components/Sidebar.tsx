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
  ChevronDown,
  Building2,
  Layout,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Tasks", icon: CheckSquare, path: "/tasks" },
  { name: "Projects", icon: Layout, path: "/projects" },
  { name: "Goals", icon: Target, path: "/goals" },
  { name: "Focus Timer", icon: Timer, path: "/focus-timer" },
  { name: "Archive", icon: Archive, path: "/archive" },
];

const bottomNavItems = [
  { name: "Settings", icon: Settings, path: "/settings" },
  { name: "Support", icon: HelpCircle, path: "/support" },
];

export function Sidebar() {
  const location = useLocation();
  const { workspaces, currentWorkspaceId, setCurrentWorkspaceId } = useAuth();

  const currentWorkspace = workspaces.find(w => w.id === currentWorkspaceId);

  return (
    <aside className="bg-white border-[#e2e8f0] border-r border-solid flex flex-col h-screen items-start justify-between pt-[32px] relative shrink-0 w-[256px] sticky top-0">
      <div className="w-full flex flex-col gap-6">
        <div className="flex flex-col gap-[16px] items-start px-[24px] w-full">
          <div className="flex flex-col gap-[4px] w-full">
            <div className="flex flex-col font-['Spline_Sans',sans-serif] font-bold justify-center text-[#0f172a] text-[24px] tracking-[-1.2px] w-full">
              <p className="leading-[32px]">FOCUS</p>
            </div>
            <div className="flex flex-col font-['Inter',sans-serif] font-normal justify-center text-[#64748b] text-[12px] tracking-[1.2px] uppercase w-full">
              <p className="leading-[16px]">DEEP WORK ENGINE</p>
            </div>
          </div>

          <div className="w-full relative group">
            <select
              value={currentWorkspaceId || ''}
              onChange={(e) => setCurrentWorkspaceId(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            >
              <option value="" disabled>Select Workspace</option>
              {workspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </option>
              ))}
            </select>
            <div className="flex items-center justify-between w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md group-hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-6 h-6 rounded bg-cu-purple/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-3.5 h-3.5 text-cu-purple" />
                </div>
                <span className="text-[13px] font-medium text-slate-700 truncate">
                  {currentWorkspace?.name || 'Select Workspace'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="px-[16px] w-full">
          <Link to="/tasks/new" className="bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] drop-shadow-[0px_4px_6px_rgba(139,92,246,0.2)] flex gap-[8px] items-center justify-center px-[16px] py-[12px] rounded-[4px] w-full hover:opacity-90 transition-opacity cursor-pointer border-none no-underline">
            <Plus className="w-[14px] h-[14px] text-white" />
            <span className="font-['Spline_Sans',sans-serif] font-semibold text-[12px] text-white tracking-[1.2px]">
              New Task
            </span>
          </Link>
        </div>

        <nav className="flex flex-col gap-[4px] px-[8px] w-full">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname.startsWith('/dashboard'));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex gap-[12px] items-center px-[16px] py-[12px] rounded-[4px] w-full transition-colors",
                  isActive
                    ? "bg-[#f5f3ff] border-[#7b68ee] border-l-2 text-[#6d28d9]"
                    : "text-[#475569] hover:bg-slate-50"
                )}
              >
                <item.icon className={cn("w-[18px] h-[18px]", isActive ? "text-[#6d28d9]" : "text-[#475569]")} />
                <span className="font-['Inter',sans-serif] font-normal text-[12px] tracking-[1.2px] uppercase">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-[#f1f5f9] border-t w-full pb-[16px] pt-[17px] px-[16px] flex flex-col gap-[4px]">
        {bottomNavItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className="flex gap-[12px] items-center px-[16px] py-[12px] rounded-[4px] w-full text-[#475569] hover:bg-slate-50 transition-colors"
          >
            <item.icon className="w-[20px] h-[20px] text-[#475569]" />
            <span className="font-['Inter',sans-serif] font-normal text-[12px] tracking-[1.2px] uppercase">
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
