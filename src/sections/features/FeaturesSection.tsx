import { FeaturesCard } from "@/components/ui/FeaturesCard";
import { Zap, Layers, Rocket} from "lucide-react";
import './FeaturesSection.css'

const features = [
  {
    icon: Layers,
    head: "Task Management",
    description: "Organize your daily goals with a simple, keyboard-driven list. Drag, drop, done.",
    iconColorClass: "text-cu-purple",
    iconBgClass: "bg-cu-purple/10"
  },
  {
    icon: Zap,
    head: "Instant Sync",
    description: "Changes reflect instantly across all devices. Offline support included.",
    iconColorClass: "text-cu-pink",
    iconBgClass: "bg-cu-pink/10"
  },
  {
    icon: Rocket,
    head: "Seamless Scaling",
    description: "Visualize progress without the clutter of traditional dashboards. Real-time updates without the noise.",
    iconColorClass: "text-cu-orange",
    iconBgClass: "bg-cu-orange/10"
  },
  {
    icon: Layers,
    head: "Custom Workflows",
    description: "Adapt the app to your team's unique processes with fully customizable statuses and fields.",
    iconColorClass: "text-cu-blue",
    iconBgClass: "bg-cu-blue/10"
  },
  {
    icon: Zap,
    head: "Automations",
    description: "Save time by automating repetitive tasks and streamlining your team's workflow.",
    iconColorClass: "text-cu-green",
    iconBgClass: "bg-cu-green/10"
  },
];

function FeaturesSection() {
  return (
    <section className="flex flex-col self-stretch px-4 md:px-16 lg:px-64 py-16 md:py-24 w-full gap-8 md:gap-16 items-center">
    
        <div className="text-center gap-4 space-y-4">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 md:text-5xl">
            Designed for Deep Work
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Remove the clutter. Focus provides a vibrant environment where your
content is clearly organized and accessible.
          </p>
        </div>
        
        <div className="featureGrid gap-[1px] bg-gray-200 border border-gray-200 rounded-xl overflow-hidden shadow-sm w-full max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <FeaturesCard
              className={`feature${index} w-full h-full bg-white`}
              key={index}
              icon={feature.icon}
              head={feature.head}
              description={feature.description}
              iconColorClass={feature.iconColorClass}
              iconBgClass={feature.iconBgClass}
            />
          )
          )}
        </div>
  
    </section>
  );
}

export { FeaturesSection };