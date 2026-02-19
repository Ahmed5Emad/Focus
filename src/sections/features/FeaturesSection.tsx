import { FeaturesCard } from "@/components/ui/FeaturesCard";
import { Zap, Layers, Rocket} from "lucide-react";

const features = [
  {
    icon: Layers,
    head: "Simplicity",
    description: "Only the tools you need, exactly where you need them. No menu hopping, no hidden settings."
  },
  {
    icon: Zap,
    head: "Lightning Fast",
    description: "Built for performance. Zero lag, instant sync, total flow. Every action happens in milliseconds."
  },
  {
    icon: Rocket,
    head: "Seamless Scaling",
    description: "Grow your project without worrying about any limits."
  },
];

function FeaturesSection() {
  return (
    <section className="py-12 px-4 md:py-24 w-full">
      <div className=" mx-auto w-full space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 md:text-5xl">
            Designed for Deep Work
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience a project management tool that gets out of your way and lets you
            do what you do best.
          </p>
        </div>
        
        <div className="flex flex-row mx-32 gap-6">
          {features.map((feature, index) => (
            <FeaturesCard
              key={index}
              icon={feature.icon}
              head={feature.head}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export { FeaturesSection };