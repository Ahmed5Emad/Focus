import { FeaturesCard } from "@/components/ui/FeaturesCard";
import { Zap, Layers, Rocket} from "lucide-react";
import './FeaturesSection.css'

const features = [
  {
    icon: Layers,
    head: "Task Management",
    description: "Organize your daily goals with a simple, keyboard-driven list. Drag, drop, done."
  },
  {
    icon: Zap,
    head: "Instant Sync",
    description: "Changes reflect instantly across all devices. Offline support included."
  },
  {
    icon: Rocket,
    head: "Seamless Scaling",
    description: "Visualize progress without the clutter of traditional dashboards. Real-time updates without the noise."
  },
  {
    icon: Rocket,
    head: "Seamless Scaling",
    description: "Visualize progress without the clutter of traditional dashboards. Real-time updates without the noise."
  },
  {
    icon: Rocket,
    head: "Seamless Scaling",
    description: "Visualize progress without the clutter of traditional dashboards. Real-time updates without the noise."
  },
];

function FeaturesSection() {
  return (
    <section className="flex flex-col self-stretch px-16 py-24 md:px-64 md:py-24 w-full gap-16 items-center">
    
        <div className="text-center gap-4 space-y-4">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 md:text-5xl">
            Designed for Deep Work
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Remove the clutter. Focus provides a stripped-down environment where your
content is the only thing that matters.
          </p>
        </div>
        
        <div className="featureGrid  gap-0">
          {features.map((feature, index) => (
            <FeaturesCard
              className={`feature${index} w-full`}
              key={index}
              icon={feature.icon}
              head={feature.head}
              description={feature.description}
            />
          )
          )}
        </div>
  
    </section>
  );
}

export { FeaturesSection };