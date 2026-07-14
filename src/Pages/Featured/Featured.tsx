import { Header } from "@/components/layout/Header";
import Footer from "@/sections/footer/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BrainCircuit, Timer, FileText, MessageCircle, CheckSquare, Workflow, Command, Target, BarChart3, Users, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureBadgeProps {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  colorClass: string;
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  colorClass: string;
  bgClass: string;
}

const FeatureBadge = ({ icon: Icon, text, colorClass }: FeatureBadgeProps) => (
  <span className={cn("text-sm font-bold tracking-widest uppercase flex items-center gap-2", colorClass)}>
    <Icon className="w-4 h-4" /> {text}
  </span>
);

const StatCard = ({ icon: Icon, value, label, colorClass, bgClass }: StatCardProps) => (
  <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-2">
    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", bgClass)}>
      <Icon className={cn("w-5 h-5", colorClass)} />
    </div>
    <span className="text-2xl font-bold text-foreground tracking-tight">{value}</span>
    <span className="text-sm text-muted-foreground">{label}</span>
  </div>
);

export default function Featured() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex flex-col items-center w-full pb-24">
        
        {/* Hero */}
        <section className="flex flex-col items-center w-full max-w-7xl pt-20 pb-16 px-4 md:pt-32 md:pb-24 md:px-6 gap-8">
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-foreground tracking-tight text-center leading-none">
            Your Entire Workflow, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cu-purple via-cu-pink to-cu-orange pb-2">Unified.</span>
          </h1>
          <p className="text-xl text-muted-foreground text-center max-w-2xl leading-relaxed mt-4">
            Tasks, documents, chat, goals, and focus tools — all deeply integrated. 
            One workspace designed for teams who value speed and clarity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button
              className="shadow-xl bg-cu-purple hover:bg-cu-purple/90 text-white px-8 h-14 font-bold text-lg rounded-xl cursor-pointer"
              onClick={() => navigate("/signup")}
            >
              Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mt-12">
            <StatCard icon={BarChart3} value="Flow Score" label="Algorithmic focus quality metric" colorClass="text-cu-purple" bgClass="bg-cu-purple/10" />
            <StatCard icon={Target} value="Goals" label="Track progress with linked tasks" colorClass="text-cu-green" bgClass="bg-cu-green/10" />
            <StatCard icon={Users} value="Team" label="Real-time collaboration" colorClass="text-cu-blue" bgClass="bg-cu-blue/10" />
            <StatCard icon={Sparkles} value="⌘K" label="Universal command palette" colorClass="text-cu-orange" bgClass="bg-cu-orange/10" />
          </div>
        </section>

        {/* Feature: Dashboard & Flow Score */}
        <section className="flex flex-col md:flex-row max-w-6xl w-full gap-12 md:gap-20 items-center border-t border-border py-20 md:py-28 px-6">
          <div className="flex-1 flex flex-col gap-5">
            <FeatureBadge icon={BrainCircuit} text="01_Analytics" colorClass="text-cu-purple" />
            <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
              Know Your Productivity —<br />Quantified.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Flow Score measures your focus quality in real-time. Track deep work hours, 
              monitor daily streaks, and watch weekly trends. Every session, every distraction, 
              every insight at a glance.
            </p>
            <ul className="space-y-3 mt-2">
              {[
                "Flow Score: algorithmic quality metric (0–100)",
                "Deep Work hours with 7-day trend chart",
                "Focus Streak counter with daily consistency tracking",
                "Priority Pipeline: see what needs attention now",
                "Active Goals with progress bars and deadlines",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-foreground">
                  <div className="w-5 h-5 rounded-full bg-cu-purple/20 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-cu-purple"></div>
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 w-full bg-card border border-border rounded-2xl p-6 shadow-sm aspect-video flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[1px] text-muted-foreground uppercase">Flow Score</span>
              <div className="w-8 h-8 rounded-full bg-[#f5f3ff] flex items-center justify-center">
                <BrainCircuit className="w-4 h-4 text-cu-purple" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold text-foreground tracking-tight drop-shadow-[0_4px_8px_rgba(123,104,238,0.35)]">72</span>
              <span className="text-muted-foreground text-lg">/100</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#6366f1]" style={{ width: "72%" }}></div>
            </div>
            <div className="grid grid-cols-7 gap-1.5 mt-auto">
              {[40, 55, 48, 68, 72, 65, 60].map((val, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-full rounded-sm bg-gradient-to-t from-cu-purple to-cu-purple/60" style={{ height: `${val}%`, minHeight: "12px" }}></div>
                  <span className="text-[9px] text-muted-foreground">{["M","T","W","T","F","S","S"][i]}</span>
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-emerald-500 font-semibold">+12%</span> vs last week
            </div>
          </div>
        </section>

        {/* Feature: Focus Timer */}
        <section className="flex flex-col md:flex-row-reverse max-w-6xl w-full gap-12 md:gap-20 items-center border-t border-border bg-muted/30 py-20 md:py-28 px-6">
          <div className="flex-1 flex flex-col gap-5">
            <FeatureBadge icon={Timer} text="02_Focus" colorClass="text-cu-pink" />
            <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
              Deep Work,<br />On Purpose.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Start a focus session linked to any task. The timer runs, distractions get logged, 
              and every completed session builds your Flow Score. Pomodoro never felt this intentional.
            </p>
            <ul className="space-y-3 mt-2">
              {[
                "Start/pause/resume with task linking",
                "Real-time distraction logging (internal/external)",
                "Session history with duration, score, and status",
                "Live distraction feed during active sessions",
                "Zero-distraction encouragement & streak tracking",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-foreground">
                  <div className="w-5 h-5 rounded-full bg-cu-pink/20 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-cu-pink"></div>
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 w-full bg-card border border-border rounded-2xl p-6 shadow-sm aspect-video flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold tracking-[1px] text-muted-foreground uppercase">Active Session</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-cu-green animate-pulse"></div>
                <span className="text-[10px] font-bold text-cu-green uppercase">Focusing</span>
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="relative">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-muted" strokeWidth="6" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#7b68ee" strokeWidth="6" strokeDasharray="263.89" strokeDashoffset="65.97" strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-foreground">24:00</span>
              </div>
              <span className="text-sm font-medium text-muted-foreground">Design System UI</span>
            </div>
          </div>
        </section>

        {/* Feature: Documents */}
        <section className="flex flex-col md:flex-row max-w-6xl w-full gap-12 md:gap-20 items-center border-t border-border py-20 md:py-28 px-6">
          <div className="flex-1 flex flex-col gap-5">
            <FeatureBadge icon={FileText} text="03_Docs" colorClass="text-cu-orange" />
            <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
              Documents That<br />Work Together.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Real-time collaborative editing powered by TipTap. Comments on selected text, 
              task linking, code blocks with syntax highlighting, tables, and images — 
              all syncing instantly across your team.
            </p>
            <ul className="space-y-3 mt-2">
              {[
                "Real-time collaboration with live cursors",
                "Inline comments anchored to text selections",
                "Task linking — connect docs to tasks and goals",
                "Rich formatting: tables, code blocks, lists, images",
                "Auto-save with connection status indicator",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-foreground">
                  <div className="w-5 h-5 rounded-full bg-cu-orange/20 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-cu-orange"></div>
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 w-full bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-cu-red"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-cu-yellow"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-cu-green"></div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-cu-green"></div>
                <span className="text-[10px] text-cu-green font-semibold">Synced</span>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="h-6 w-3/4 bg-muted rounded"></div>
              <div className="h-4 w-full bg-muted/60 rounded"></div>
              <div className="h-4 w-5/6 bg-muted/60 rounded"></div>
              <div className="flex items-start gap-3 mt-6">
                <div className="w-6 h-6 rounded-full bg-cu-purple/30 flex items-center justify-center shrink-0">
                  <span className="text-[8px] font-bold text-cu-purple">AE</span>
                </div>
                <div className="flex-1 p-3 bg-cu-purple/5 border border-cu-purple/20 rounded-lg">
                  <div className="h-3 w-4/5 bg-muted rounded mb-2"></div>
                  <div className="h-3 w-3/5 bg-muted/60 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature: Chat */}
        <section className="flex flex-col md:flex-row-reverse max-w-6xl w-full gap-12 md:gap-20 items-center border-t border-border bg-muted/30 py-20 md:py-28 px-6">
          <div className="flex-1 flex flex-col gap-5">
            <FeatureBadge icon={MessageCircle} text="04_Chat" colorClass="text-cu-blue" />
            <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
              Team Messaging,<br />Zero Noise.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Channels and direct messages with file sharing, @mentions, and typing indicators. 
              Integrated with your tasks — mention someone and they get a notification, no separate app needed.
            </p>
            <ul className="space-y-3 mt-2">
              {[
                "Channel (#general) and direct message modes",
                "File sharing: images, PDFs, docs (up to 10MB)",
                "@mentions with real-time notifications",
                "Typing indicators and read receipts",
                "Message edit, delete, and conversation management",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-foreground">
                  <div className="w-5 h-5 rounded-full bg-cu-blue/20 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-cu-blue"></div>
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 w-full bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-muted/30">
              <div className="text-sm font-bold text-foreground"># general</div>
              <div className="text-[10px] text-muted-foreground">3 online</div>
            </div>
            <div className="p-5 space-y-4">
              {[
                { name: "Alex", initial: "A", color: "bg-cu-purple/30 text-cu-purple", msg: "Ready for the sprint review?", time: "2m ago" },
                { name: "You", initial: "Y", color: "bg-cu-blue/30 text-cu-blue", msg: "Pushing the final changes now", time: "1m ago", self: true },
                { name: "Sam", initial: "S", color: "bg-cu-green/30 text-cu-green", msg: "Flow Score hit 85 today 🔥", time: "Just now" },
              ].map((msg) => (
                <div key={msg.msg} className={cn("flex items-start gap-3", msg.self && "flex-row-reverse")}>
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold", msg.color)}>
                    {msg.initial}
                  </div>
                  <div className={cn("flex flex-col", msg.self ? "items-end" : "items-start")}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-foreground">{msg.name}</span>
                      <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                    </div>
                    <div className={cn("px-3 py-2 rounded-lg text-sm", msg.self ? "bg-cu-purple/10 text-foreground" : "bg-muted text-foreground")}>
                      {msg.msg}
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-xs text-cu-purple italic">Sam is typing...</div>
            </div>
          </div>
        </section>

        {/* Feature: Tasks */}
        <section className="flex flex-col md:flex-row max-w-6xl w-full gap-12 md:gap-20 items-center border-t border-border py-20 md:py-28 px-6">
          <div className="flex-1 flex flex-col gap-5">
            <FeatureBadge icon={CheckSquare} text="05_Tasks" colorClass="text-cu-green" />
            <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
              Tasks That Fit<br />Your Brain.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Three views — List, Calendar, and Kanban — so you can work the way you think. 
              Add dependencies, set recurrence rules, save templates, and define custom fields. 
              Tasks finally flexible enough for real workflows.
            </p>
            <ul className="space-y-3 mt-2">
              {[
                "List / Calendar / Kanban view modes",
                "Task dependencies, recurrence, and templates",
                "Custom fields: text, number, date, select, multi-select",
                "Workflow statuses — fully customizable pipelines",
                "Priority indicators, assignees, tracked time, and filters",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-foreground">
                  <div className="w-5 h-5 rounded-full bg-cu-green/20 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-cu-green"></div>
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 w-full bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold tracking-[1px] text-muted-foreground uppercase">Priority Tasks</span>
              <div className="flex gap-1">
                <div className="px-2 py-1 rounded-md bg-cu-purple/10 text-[10px] font-semibold text-cu-purple">List</div>
                <div className="px-2 py-1 rounded-md bg-muted text-[10px] text-muted-foreground">Calendar</div>
                <div className="px-2 py-1 rounded-md bg-muted text-[10px] text-muted-foreground">Board</div>
              </div>
            </div>
            {[
              { title: "Design system migration", priority: "bg-red-500", status: "In Progress", due: "Today" },
              { title: "Q3 roadmap planning", priority: "bg-cu-orange", status: "To Do", due: "Tomorrow" },
              { title: "API rate limiting audit", priority: "bg-blue-500", status: "In Progress", due: "In 3d" },
              { title: "Update onboarding flow", priority: "bg-slate-400", status: "To Do", due: "" },
            ].map((task, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 shrink-0"></div>
                <div className={`w-2 h-2 rounded-full ${task.priority} shrink-0`}></div>
                <div className="flex-1 text-sm text-foreground truncate">{task.title}</div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-cu-purple/10 text-cu-purple">{task.status}</span>
                {task.due && <span className="text-[10px] font-medium text-muted-foreground">{task.due}</span>}
              </div>
            ))}
          </div>
        </section>

        {/* Feature: Custom Workflows */}
        <section className="flex flex-col md:flex-row-reverse max-w-6xl w-full gap-12 md:gap-20 items-center border-t border-border bg-muted/30 py-20 md:py-28 px-6">
          <div className="flex-1 flex flex-col gap-5">
            <FeatureBadge icon={Workflow} text="06_Adapt" colorClass="text-cu-purple" />
            <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
              Your Process,<br />Your Rules.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Custom status pipelines, custom fields, integrations — Focus adapts to your team's process, 
              not the other way around. Connect GitHub, Slack, Google Calendar, and more.
            </p>
            <ul className="space-y-3 mt-2">
              {[
                "Custom workflow statuses (color-coded, reorderable)",
                "Custom fields: text, number, date, select, multi-select",
                "6 integrations: Slack, GitHub, Discord, Google Calendar, Notion, Linear",
                "REST API for custom integrations (coming soon)",
                "Multi-workspace with role management (admin, member)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-foreground">
                  <div className="w-5 h-5 rounded-full bg-cu-purple/20 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-cu-purple"></div>
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 w-full bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold tracking-[1px] text-muted-foreground uppercase">Workflow Statuses</span>
            </div>
            <div className="space-y-2">
              {[
                { name: "To Do", color: "bg-slate-400" },
                { name: "In Progress", color: "bg-blue-500" },
                { name: "Review", color: "bg-cu-orange" },
                { name: "Done", color: "bg-cu-green" },
              ].map((status) => (
                <div key={status.name} className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className={`w-2.5 h-2.5 rounded-full ${status.color}`}></div>
                  <span className="text-sm text-foreground">{status.name}</span>
                  <div className="ml-auto flex items-center gap-1">
                    <div className="w-5 h-5 rounded bg-muted flex items-center justify-center cursor-default">
                      <svg className="w-3 h-3 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                    </div>
                    <div className="w-5 h-5 rounded bg-muted flex items-center justify-center cursor-default">
                      <svg className="w-3 h-3 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-border">
              <span className="text-[10px] font-bold tracking-[1px] text-muted-foreground uppercase">Integrations</span>
              <div className="flex flex-wrap gap-2 mt-3">
                {["Slack", "GitHub", "Discord", "Google Calendar", "Notion", "Linear"].map((name) => (
                  <div key={name} className="px-3 py-1.5 rounded-lg bg-muted text-xs font-medium text-muted-foreground border border-border">
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="flex flex-col items-center max-w-4xl w-full mt-16 px-6 gap-8 py-20 bg-foreground text-background dark:bg-card dark:text-card-foreground rounded-3xl mx-6">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-center">
            Ready to Focus?
          </h2>
          <p className="text-lg opacity-80 text-center max-w-xl">
            Join thousands of engineers and creators who've reclaimed their deep work.
          </p>
          <Button
            className="bg-background text-foreground dark:bg-foreground dark:text-background hover:bg-muted px-8 h-14 font-bold text-lg rounded-xl cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </section>

      </main>
      <Footer />
    </div>
  );
}
