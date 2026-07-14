import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutDashboard, CheckSquare, Layout, Target, FileText, MessageCircle, Timer, Archive, Settings, HelpCircle, BrainCircuit, CheckCircle2, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function HeroSection() {
  const navigate = useNavigate();
  return (
    <div className="w-full flex my-16 self-stretch flex-col items-center px-4 md:px-16 lg:px-32">
      <div className="flex mb-4 flex-col w-full md:w-3/4 lg:w-1/2 items-center justify-center gap-2">
        <h1 className="text-4xl md:text-7xl lg:text-8xl -tracking-wide text-center font-black">
          One App to <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cu-purple via-cu-pink to-cu-orange pb-2">Replace Them All.</span>
        </h1>
        <p className="text-center mt-8 text-muted-foreground text-lg md:text-xl max-w-2xl">
          Tasks, Docs, Chat, Goals, Focus Timer & more. <br />
          A vibrant workspace for high-performing teams who value speed and clarity.
        </p>
        <div className="flex flex-col md:flex-row mt-10 mb-12 gap-4">
          <Button
            size="lg"
            className="shadow-xl bg-cu-purple hover:bg-cu-purple/90 text-white px-8 h-14 font-bold text-lg rounded-xl cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="shadow-sm px-8 h-14 font-bold text-lg rounded-xl border-2 hover:bg-muted cursor-pointer"
            >
            View Features
          </Button>
        </div>
      </div>
      <div className="flex flex-col max-w-7xl w-full items-center content-start px-4 md:px-0">
        <div className="flex flex-col self-stretch content-start w-full rounded-2xl h-[400px] md:h-[650px] border border-border bg-card shadow-2xl overflow-hidden relative">
          {/* ── Sidebar ── */}
          <div className="flex flex-1 overflow-hidden">
            <div className="hidden md:flex w-56 border-r border-border bg-muted/20 flex-col shrink-0">
              {/* Branding */}
              <div className="px-5 pt-5 pb-3">
                <div className="flex items-center gap-2.5 mb-0.5">
                  <div className="w-6 h-6 rounded-md bg-cu-purple/20 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-sm bg-cu-purple"></div>
                  </div>
                  <span className="font-bold text-sm tracking-tight text-foreground">FOCUS</span>
                </div>
                <p className="text-[10px] tracking-[1px] uppercase text-muted-foreground font-medium ml-[34px]">Deep Work Engine</p>
              </div>
              {/* Workspace */}
              <div className="px-4 mb-2">
                <div className="h-8 rounded-md bg-muted border border-border flex items-center px-3 gap-2">
                  <div className="w-3 h-3 rounded bg-cu-purple/60"></div>
                  <div className="h-2.5 w-20 rounded bg-muted-foreground/30"></div>
                </div>
              </div>
              {/* New Task */}
              <div className="px-4 mb-3">
                <div className="h-8 rounded-[4px] bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] flex items-center justify-center gap-1.5">
                  <div className="w-3 h-3 text-white">+</div>
                  <span className="text-[10px] text-white font-semibold tracking-[1px]">NEW TASK</span>
                </div>
              </div>
              {/* Nav Items */}
              <nav className="flex-1 flex flex-col gap-0.5 px-3">
                {[
                  { label: "Dashboard", active: true, icon: LayoutDashboard },
                  { label: "Tasks", active: false, icon: CheckSquare },
                  { label: "Projects", active: false, icon: Layout },
                  { label: "Goals", active: false, icon: Target },
                  { label: "Documents", active: false, icon: FileText },
                  { label: "Chat", active: false, icon: MessageCircle },
                  { label: "Focus Timer", active: false, icon: Timer },
                  { label: "Archive", active: false, icon: Archive },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-[4px] ${
                        item.active
                          ? "bg-[#f5f3ff] border-l-2 border-cu-purple"
                          : "text-muted-foreground"
                      }`}
                    >
                      <Icon className={`w-[14px] h-[14px] ${item.active ? "text-cu-purple" : "text-muted-foreground/60"}`} />
                      <span className={`text-[10px] tracking-[1px] uppercase font-medium ${
                        item.active ? "text-[#6d28d9]" : "text-muted-foreground"
                      }`}>
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </nav>
              {/* Bottom Nav */}
              <div className="border-t border-border px-3 py-3">
                {[{ label: "Settings", icon: Settings }, { label: "Support", icon: HelpCircle }].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center gap-3 px-3 py-2.5 rounded-[4px] text-muted-foreground">
                      <Icon className="w-[14px] h-[14px] text-muted-foreground/60" />
                      <span className="text-[10px] tracking-[1px] uppercase font-medium">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Main Content ── */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* TopBar */}
              <div className="h-14 border-b border-border flex items-center px-4 md:px-6 gap-3 bg-muted/30">
                <div className="flex gap-1.5 md:hidden">
                  <div className="w-2.5 h-2.5 rounded-full bg-cu-red"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-cu-yellow"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-cu-green"></div>
                </div>
                {/* Search bar */}
                <div className="flex-1 max-w-md flex items-center gap-2 h-8 px-3 rounded-full bg-card border border-border/60 shadow-sm">
                  <div className="w-3.5 h-3.5 text-muted-foreground/50">⌕</div>
                  <div className="flex-1 h-3 rounded bg-muted-foreground/15"></div>
                  <div className="hidden sm:flex items-center gap-1">
                    <kbd className="bg-card/80 border border-border/60 px-1.5 py-0.5 rounded text-[8px] text-muted-foreground">⌘</kbd>
                    <kbd className="bg-card/80 border border-border/60 px-1.5 py-0.5 rounded text-[8px] text-muted-foreground">K</kbd>
                  </div>
                </div>
                {/* TopBar icons */}
                <div className="flex items-center gap-2 ml-auto">
                  <div className="w-8 h-8 rounded-xl bg-muted/50"></div>
                  <div className="w-8 h-8 rounded-xl bg-muted/50"></div>
                  <div className="w-8 h-8 rounded-full border-2 border-border/60 bg-muted/30"></div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
                {/* Greeting Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="h-8 w-56 bg-muted rounded-lg"></div>
                    <div className="h-4 w-40 bg-muted-foreground/20 rounded"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-28 rounded-lg border border-border bg-card flex items-center justify-center gap-2">
                      <div className="w-3 h-3 text-muted-foreground/40">⚡</div>
                      <span className="text-[8px] font-semibold tracking-[1px] text-muted-foreground">QUICK TASK</span>
                    </div>
                    <div className="h-9 w-32 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] flex items-center justify-center gap-2 shadow-sm">
                      <div className="w-3 h-3 fill-white/80">▶</div>
                      <span className="text-[8px] font-semibold tracking-[1px] text-white">START SESSION</span>
                    </div>
                  </div>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: "Flow Score", value: "72", suffix: "/100", icon: BrainCircuit, iconColor: "text-cu-purple", iconBg: "bg-[#f5f3ff]", accent: "from-[#8b5cf6] to-[#6366f1]" },
                    { label: "Deep Work", value: "4h 12m", icon: Timer, iconColor: "text-cu-green", iconBg: "bg-[#ecfdf5]", accent: "bg-[#10b981]" },
                    { label: "Tasks Done", value: "8", suffix: "/14", icon: CheckCircle2, iconColor: "text-cu-blue", iconBg: "bg-[#eff6ff]", accent: "bg-[#3b82f6]" },
                    { label: "Focus Streak", value: "5", suffix: " days", icon: Flame, iconColor: "text-cu-orange", iconBg: "bg-[#fff7ed]", accent: "bg-[#f97316]" },
                  ].map((card) => {
                    const Icon = card.icon;
                    return (
                    <div key={card.label} className="bg-card border border-border rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-4 flex flex-col gap-2">
                      <div className="flex items-start justify-between">
                        <span className="text-[9px] font-semibold tracking-[1px] text-muted-foreground uppercase">{card.label}</span>
                        <div className={`w-8 h-8 ${card.iconBg} rounded-full flex items-center justify-center shrink-0`}>
                          <Icon className={`w-4 h-4 ${card.iconColor}`} />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-foreground tracking-tight">{card.value}</span>
                        {card.suffix && <span className="text-xs text-muted-foreground">{card.suffix}</span>}
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${card.accent}`} style={{ width: "65%" }}></div>
                      </div>
                    </div>
                  )})}
                </div>

                {/* Priority Pipeline */}
                <div className="bg-card border border-border rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 text-muted-foreground/40">☰</div>
                      <span className="text-[10px] font-semibold tracking-[1px] text-foreground uppercase">Priority Pipeline</span>
                    </div>
                    <span className="text-[10px] font-semibold text-cu-purple">View All →</span>
                  </div>
                  <div className="px-5 pb-3 flex flex-col">
                    {[
                      { title: "Design system migration", priority: "bg-red-500", due: "Today", urgent: true },
                      { title: "Q3 roadmap planning", priority: "bg-cu-orange", due: "Tomorrow", urgent: false },
                      { title: "API rate limiting audit", priority: "bg-blue-500", due: "In 3d", urgent: false },
                      { title: "Update onboarding flow", priority: "bg-slate-400", due: "", urgent: false },
                    ].map((task, i) => (
                      <div key={i} className={`flex items-center gap-3 py-3 ${i > 0 ? "border-t border-border" : ""}`}>
                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 shrink-0"></div>
                        <div className={`w-2 h-2 rounded-full ${task.priority} shrink-0`}></div>
                        <div className="flex-1">
                          <div className="h-3.5 w-3/5 bg-muted rounded"></div>
                        </div>
                        {task.due && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            task.urgent ? "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400" : "bg-muted text-muted-foreground"
                          }`}>
                            {task.due}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Goals (simplified) */}
                <div className="bg-card border border-border rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 text-muted-foreground/40">🎯</div>
                      <span className="text-[10px] font-semibold tracking-[1px] text-foreground uppercase">Active Goals</span>
                    </div>
                  </div>
                  <div className="px-5 pb-4 space-y-4">
                    {[
                      { title: "Launch v2.0", cat: "PRODUCT", progress: 72 },
                      { title: "Improve test coverage", cat: "ENGINEERING", progress: 45 },
                    ].map((goal) => (
                      <div key={goal.title} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-3.5 w-28 bg-muted rounded"></div>
                            <span className="text-[8px] font-bold tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{goal.cat}</span>
                          </div>
                          <span className="text-[10px] font-semibold text-muted-foreground">{goal.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#6366f1]" style={{ width: `${goal.progress}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
