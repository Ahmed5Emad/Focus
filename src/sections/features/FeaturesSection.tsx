import { BrainCircuit, Timer, FileText, MessageCircle, CheckSquare, Workflow } from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    head: "Dashboard Analytics",
    description: "Flow Score, Deep Work tracking, daily streaks, and weekly trends. Know exactly how productive you are with data-driven insights.",
    iconColorClass: "text-cu-purple",
    iconBgClass: "bg-cu-purple/10"
  },
  {
    icon: Timer,
    head: "Focus Timer",
    description: "Pomodoro-style sessions with real-time distraction logging. Track every interruption and watch your Flow Score improve over time.",
    iconColorClass: "text-cu-pink",
    iconBgClass: "bg-cu-pink/10"
  },
  {
    icon: FileText,
    head: "Rich Documents",
    description: "Real-time collaborative editor with inline comments, task linking, code blocks, and tables. Edit together without the lag.",
    iconColorClass: "text-cu-orange",
    iconBgClass: "bg-cu-orange/10"
  },
  {
    icon: MessageCircle,
    head: "Team Chat",
    description: "Channels, direct messages, file sharing, and @mentions. Real-time messaging integrated with your tasks and projects.",
    iconColorClass: "text-cu-blue",
    iconBgClass: "bg-cu-blue/10"
  },
  {
    icon: CheckSquare,
    head: "Smart Tasks",
    description: "List, Calendar, or Kanban views. Dependencies, recurrence, custom fields, and templates — tasks that adapt to your workflow.",
    iconColorClass: "text-cu-green",
    iconBgClass: "bg-cu-green/10"
  },
  {
    icon: Workflow,
    head: "Custom Workflows",
    description: "Build your own status pipelines, add custom fields, connect integrations like GitHub and Slack. The tool bends to you.",
    iconColorClass: "text-cu-purple",
    iconBgClass: "bg-cu-purple/10"
  },
];

function FeaturesSection() {
  return (
    <section className="flex flex-col self-stretch px-4 md:px-16 lg:px-64 py-16 md:py-24 w-full gap-8 md:gap-16 items-center">
    
        <div className="text-center gap-4 space-y-4">
          <h2 className="text-3xl font-black tracking-tight text-foreground md:text-5xl">
            Everything You Need to Focus
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Not another tool to check — the central hub for your team's deep work. Tasks, docs, chat, and focus tools all in one place.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col gap-4 p-8 bg-card border border-border rounded-xl shadow-sm hover:bg-muted/50 transition-all"
            >
              <div className={"flex h-12 w-12 border border-border items-center shadow-[0_1px_2px_rgba(0,0,0,0.05)] justify-center rounded-lg " + feature.iconBgClass + " " + feature.iconColorClass}>
                <feature.icon className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-xl leading-none tracking-tight text-foreground">
                  {feature.head}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
  
    </section>
  );
}

export { FeaturesSection };
